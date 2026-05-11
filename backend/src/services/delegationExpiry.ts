import { supabase } from '../db/supabase.js'
import { sendExpiryOwnerEmail } from './emailService.js'

async function expireStaleTokens(): Promise<void> {
  const now = new Date().toISOString()

  // Find active delegations that have passed their expiry
  const { data: stale, error } = await supabase
    .from('access_delegations')
    .select('id, owner_id, delegate_name, delegate_email, platforms')
    .eq('status', 'active')
    .lt('expires_at', now)

  if (error) {
    console.error('[delegationExpiry] Query error:', error.message)
    return
  }

  if (!stale?.length) return

  console.log(`[delegationExpiry] Expiring ${stale.length} delegation(s)`)

  for (const delegation of stale) {
    // Update status to expired
    await supabase
      .from('access_delegations')
      .update({ status: 'expired', password_change_reminder_sent: true })
      .eq('id', delegation.id)

    // Log the expiry
    await supabase.from('delegation_activity_log').insert({
      delegation_id: delegation.id,
      action: 'session_expired',
      detail: 'Delegation automatically expired by system',
    })

    // Get owner email
    const { data: owner } = await supabase
      .from('users')
      .select('creator_handle')
      .eq('id', delegation.owner_id)
      .single()

    // Get owner auth email
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(delegation.owner_id)
    const ownerEmail = authUser?.email

    if (ownerEmail) {
      try {
        await sendExpiryOwnerEmail({
          ownerEmail,
          delegateName: delegation.delegate_name,
          platforms: delegation.platforms,
        })
      } catch (emailErr) {
        console.error('[delegationExpiry] Email send failed:', emailErr)
      }
    }

    // Add in-app notification by inserting into a notifications table
    // (Using threats table as a notification mechanism — in production use a dedicated notifications table)
    try {
      await supabase.from('threats').insert({
        user_id: delegation.owner_id,
        threat_type: 'other',
        platform: delegation.platforms[0] || 'general',
        severity: 'low',
        title: `Time to change your passwords — ${delegation.delegate_name}'s session has ended`,
        description: `${delegation.delegate_name}'s temporary access to ${delegation.platforms.join(', ')} has expired. Change your passwords now to keep your accounts secure.`,
        is_resolved: false,
      })
    } catch {
      // Non-fatal
    }

    console.log(`[delegationExpiry] Expired delegation ${delegation.id} for ${delegation.delegate_name}`)
  }
}

export function startExpiryWorker(): void {
  const INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
  console.log('[delegationExpiry] Expiry worker started — checking every 5 minutes')

  // Run immediately on boot
  expireStaleTokens().catch((err) => console.error('[delegationExpiry] Initial run error:', err))

  setInterval(() => {
    expireStaleTokens().catch((err) => console.error('[delegationExpiry] Worker error:', err))
  }, INTERVAL_MS)
}
