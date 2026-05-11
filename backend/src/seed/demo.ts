// backend/src/seed/demo.ts
// Run with: npx tsx src/seed/demo.ts
// Or: npm run seed:demo (add this script to package.json)

import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEMO_EMAIL = 'demo@aeforyn.com'
const DEMO_PASSWORD = 'Demo1234!'

async function seedDemoUser(): Promise<string> {
  console.log('\n--- Step 1: Demo User ---')

  // Check if user already exists via admin API
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`)
  }

  const existingUser = listData.users.find((u) => u.email === DEMO_EMAIL)

  if (existingUser) {
    console.log(`User already exists: ${DEMO_EMAIL} (id: ${existingUser.id})`)
    return existingUser.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  })

  if (error) {
    throw new Error(`Failed to create demo user: ${error.message}`)
  }

  console.log(`Created demo user: ${DEMO_EMAIL} (id: ${data.user.id})`)
  return data.user.id
}

async function seedProfile(userId: string): Promise<void> {
  console.log('\n--- Step 2: Profile ---')

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: DEMO_EMAIL,
        plan_tier: 'pro',
        handle: '@demo_creator',
        security_score: 74,
      },
      { onConflict: 'id' }
    )

  if (error) {
    throw new Error(`Failed to upsert profile: ${error.message}`)
  }

  console.log('Upserted profile: plan_tier=pro, handle=@demo_creator, security_score=74')
}

async function seedPlatformMonitors(userId: string): Promise<void> {
  console.log('\n--- Step 3: Platform Monitors ---')

  const monitors = [
    { user_id: userId, platform: 'instagram', score: 85, status: 'safe' },
    { user_id: userId, platform: 'tiktok', score: 72, status: 'warning' },
    { user_id: userId, platform: 'youtube', score: 91, status: 'safe' },
    { user_id: userId, platform: 'x', score: 55, status: 'warning' },
    { user_id: userId, platform: 'gmail', score: 68, status: 'warning' },
    { user_id: userId, platform: 'patreon', score: 82, status: 'safe' },
  ]

  const { error } = await supabase
    .from('platform_monitors')
    .upsert(monitors, { onConflict: 'user_id,platform' })

  if (error) {
    throw new Error(`Failed to upsert platform monitors: ${error.message}`)
  }

  console.log(`Upserted ${monitors.length} platform monitors: instagram, tiktok, youtube, x, gmail, patreon`)
}

async function seedThreats(userId: string): Promise<void> {
  console.log('\n--- Step 4: Threats ---')

  const { count, error: countError } = await supabase
    .from('threats')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw new Error(`Failed to count threats: ${countError.message}`)
  }

  if ((count ?? 0) >= 3) {
    console.log(`Skipping threats — already have ${count} records (threshold: 3)`)
    return
  }

  const threats = [
    {
      user_id: userId,
      severity: 'critical',
      type: 'login_attempt',
      platform: 'instagram',
      description: 'Login attempt from Lagos, Nigeria',
    },
    {
      user_id: userId,
      severity: 'high',
      type: 'phishing',
      platform: 'email',
      description: 'Brand deal phishing email detected',
    },
    {
      user_id: userId,
      severity: 'medium',
      type: 'suspicious_access',
      platform: 'tiktok',
      description: 'Unusual login time at 3:47 AM',
    },
  ]

  const { error } = await supabase.from('threats').insert(threats)

  if (error) {
    throw new Error(`Failed to insert threats: ${error.message}`)
  }

  console.log(`Inserted ${threats.length} threats (critical, high, medium)`)
}

async function seedAiConversations(userId: string): Promise<void> {
  console.log('\n--- Step 5: AI Conversations ---')

  const { count, error: countError } = await supabase
    .from('ai_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw new Error(`Failed to count AI conversations: ${countError.message}`)
  }

  if ((count ?? 0) >= 2) {
    console.log(`Skipping AI conversations — already have ${count} records (threshold: 2)`)
    return
  }

  const assistantResponse = `If your Instagram account has been hacked, act quickly to regain control. First, try to log in and use the "Get more help" option on the login screen if your password has been changed. Instagram will send a recovery link to your email or phone number — check both and act within 10 minutes before the link expires. If you still have access, immediately go to Settings > Security > Password and change it to something strong and unique.

Once you've regained access, audit your account for any changes the attacker may have made. Check your connected apps under Settings > Security > Apps and Websites and revoke access to anything suspicious. Review your email address and phone number in Settings > Account > Personal Information to make sure the hacker hasn't swapped them out. Enable two-factor authentication (2FA) right away under Settings > Security > Two-Factor Authentication — use an authenticator app rather than SMS where possible.

Finally, report the incident to Instagram through their Help Center and notify your followers that your account was compromised, especially if any suspicious messages or posts were made in your name. Change your email password as well, since that's often the entry point for account takeovers. Going forward, use a unique, strong password for Instagram and avoid logging in through third-party apps or suspicious links.`

  const messages = [
    {
      user_id: userId,
      role: 'user',
      content: 'My Instagram account was hacked, what do I do?',
    },
    {
      user_id: userId,
      role: 'assistant',
      content: assistantResponse,
    },
  ]

  const { error } = await supabase.from('ai_conversations').insert(messages)

  if (error) {
    throw new Error(`Failed to insert AI conversations: ${error.message}`)
  }

  console.log(`Inserted ${messages.length} AI conversation messages (user + assistant)`)
}

async function seedImpersonation(userId: string): Promise<void> {
  console.log('\n--- Step 6: Impersonation Handles & Alerts ---')

  // Mark onboarding complete
  await supabase.from('users').update({ has_completed_impersonation_onboarding: true }).eq('id', userId)

  const { count: handleCount } = await supabase
    .from('impersonation_handles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((handleCount ?? 0) < 3) {
    const handles = [
      { user_id: userId, platform: 'instagram', handle: '@aeforyn' },
      { user_id: userId, platform: 'tiktok', handle: '@aeforyn' },
      { user_id: userId, platform: 'youtube', handle: '@aeforyn' },
    ]
    const { error } = await supabase.from('impersonation_handles').upsert(handles, { onConflict: 'user_id,platform' })
    if (error) throw new Error(`Failed to seed handles: ${error.message}`)
    console.log('Seeded 3 impersonation handles')
  } else {
    console.log(`Skipping handles — already have ${handleCount}`)
  }

  const { count: alertCount } = await supabase
    .from('impersonation_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((alertCount ?? 0) < 2) {
    const alerts = [
      {
        user_id: userId,
        platform: 'tiktok',
        fake_handle: '@aeforyn.official',
        match_type: 'handle_match',
        risk_level: 'high',
        status: 'active',
        follower_count: 1200,
        ai_analysis: 'This account closely mimics your handle with an appended .official suffix — a common impersonation tactic. The follower count indicates active engagement.',
        detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: userId,
        platform: 'instagram',
        fake_handle: '@aeforyn_creator',
        match_type: 'bio_match',
        risk_level: 'medium',
        status: 'active',
        follower_count: 340,
        ai_analysis: 'Bio text is nearly identical to your registered profile. This poses a moderate risk to brand deals and audience trust.',
        detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    const { data: insertedAlerts, error } = await supabase.from('impersonation_alerts').insert(alerts).select('id')
    if (error) throw new Error(`Failed to seed alerts: ${error.message}`)

    if (insertedAlerts?.length) {
      const timeline = [
        { alert_id: insertedAlerts[0].id, event: 'detected', description: 'Account first detected by scan', happened_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { alert_id: insertedAlerts[0].id, event: 'ai_analysed', description: 'AI risk analysis completed: high risk', happened_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
        { alert_id: insertedAlerts[1].id, event: 'detected', description: 'Account first detected by scan', happened_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      ]
      await supabase.from('impersonation_timeline').insert(timeline)
    }
    console.log('Seeded 2 impersonation alerts with timeline events')
  } else {
    console.log(`Skipping alerts — already have ${alertCount}`)
  }
}

async function seedDelegations(userId: string): Promise<void> {
  console.log('\n--- Step 7: Access Delegations ---')

  const { count } = await supabase
    .from('access_delegations')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)

  if ((count ?? 0) >= 2) {
    console.log(`Skipping delegations — already have ${count}`)
    return
  }

  const { data: delegations, error } = await supabase.from('access_delegations').insert([
    {
      owner_id: userId,
      delegate_name: 'Sarah (VA)',
      delegate_email: 'sarah@example.com',
      platforms: ['Instagram', 'TikTok'],
      vault_item_ids: [],
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      password_changed_after: false,
      access_token: 'demo-token-sarah-' + userId.slice(0, 8),
    },
    {
      owner_id: userId,
      delegate_name: 'James (Editor)',
      delegate_email: 'james@example.com',
      platforms: ['YouTube'],
      vault_item_ids: [],
      expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'expired',
      password_changed_after: false,
      access_token: 'demo-token-james-' + userId.slice(0, 8),
    },
  ]).select('id')

  if (error) throw new Error(`Failed to seed delegations: ${error.message}`)

  if (delegations?.length) {
    const activityLog = [
      { delegation_id: delegations[0].id, action: 'link_opened', actor: 'Sarah (VA)', metadata: { ip: '102.89.23.1' } },
      { delegation_id: delegations[0].id, action: 'password_revealed', actor: 'Sarah (VA)', metadata: { platform: 'Instagram' } },
      { delegation_id: delegations[1].id, action: 'link_opened', actor: 'James (Editor)', metadata: { ip: '197.211.58.4' } },
    ]
    await supabase.from('delegation_activity_log').insert(activityLog)
  }

  console.log('Seeded 2 delegations (1 active, 1 expired) + 3 activity log entries')
}

async function main(): Promise<void> {
  console.log('=== AEFORYN Demo Account Seed ===')
  console.log(`Target: ${DEMO_EMAIL}`)

  try {
    const userId = await seedDemoUser()
    await seedProfile(userId)
    await seedPlatformMonitors(userId)
    await seedThreats(userId)
    await seedAiConversations(userId)
    await seedImpersonation(userId)
    await seedDelegations(userId)

    console.log('\n=== Seed complete ===')
    process.exit(0)
  } catch (err) {
    console.error('\n=== Seed failed ===')
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

main()
