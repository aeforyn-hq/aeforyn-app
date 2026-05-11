import { Router, Request, Response } from 'express'
import { randomBytes } from 'crypto'
import { requireAuth, requirePlan, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { sendDelegationAccessEmail } from '../services/emailService.js'

const router = Router()

// GET /api/access/delegations — all delegations for authenticated user
router.get('/delegations', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('access_delegations')
    .select('*')
    .eq('owner_id', req.userId!)
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data || [])
})

// POST /api/access/delegations — create a new delegation
router.post('/delegations', requireAuth, requirePlan(['pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { delegate_name, delegate_email, platforms, vault_item_ids, duration_hours, expires_at: customExpiry } = req.body

  if (!delegate_name || !delegate_email || !platforms?.length) {
    res.status(400).json({ error: 'delegate_name, delegate_email, and platforms are required' })
    return
  }

  const accessToken = randomBytes(32).toString('hex')
  const expiresAt = customExpiry
    ? new Date(customExpiry)
    : new Date(Date.now() + (duration_hours || 24) * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('access_delegations')
    .insert({
      owner_id: req.userId!,
      delegate_name,
      delegate_email,
      platforms,
      vault_item_ids: vault_item_ids || [],
      expires_at: expiresAt.toISOString(),
      access_token: accessToken,
      status: 'active',
    })
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }

  // Get owner info for the email
  const { data: profile } = await supabase
    .from('users')
    .select('creator_handle')
    .eq('id', req.userId!)
    .single()

  const ownerName = profile?.creator_handle || req.userEmail?.split('@')[0] || 'Your AEFORYN contact'

  // Send access email (non-fatal)
  try {
    await sendDelegationAccessEmail({
      delegateEmail: delegate_email,
      delegateName: delegate_name,
      ownerName,
      platforms,
      expiresAt,
      accessToken,
    })
  } catch (emailErr) {
    console.error('[accessDelegation] Email send failed:', emailErr)
  }

  // Log the creation
  await supabase.from('delegation_activity_log').insert({
    delegation_id: data.id,
    action: 'delegation_created',
    detail: `Access granted to ${delegate_email} for ${platforms.join(', ')}`,
  })

  res.json({ delegation: data, accessUrl: `${process.env.FRONTEND_URL}/delegate-access?token=${accessToken}` })
})

// DELETE /api/access/delegations/:id — revoke
router.delete('/delegations/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('access_delegations')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('owner_id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }

  await supabase.from('delegation_activity_log').insert({
    delegation_id: req.params.id,
    action: 'revoked',
    detail: 'Access revoked by owner',
  })

  res.json(data)
})

// GET /api/access/delegations/:id/activity — activity log
router.get('/delegations/:id/activity', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  // Verify ownership
  const { data: delegation } = await supabase
    .from('access_delegations')
    .select('id')
    .eq('id', req.params.id)
    .eq('owner_id', req.userId!)
    .single()

  if (!delegation) { res.status(404).json({ error: 'Delegation not found' }); return }

  const { data, error } = await supabase
    .from('delegation_activity_log')
    .select('*')
    .eq('delegation_id', req.params.id)
    .order('performed_at', { ascending: true })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data || [])
})

// POST /api/access/verify — public, validates token
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body
  if (!token) { res.status(400).json({ error: 'Token required' }); return }

  const { data: delegation, error } = await supabase
    .from('access_delegations')
    .select('id, delegate_name, delegate_email, platforms, vault_item_ids, expires_at, status, owner_id')
    .eq('access_token', token)
    .single()

  if (error || !delegation) {
    res.status(404).json({ error: 'Invalid or expired access link' })
    return
  }

  if (delegation.status !== 'active') {
    const msg = delegation.status === 'revoked'
      ? 'This access link has been revoked by the account owner.'
      : 'This access link has expired.'
    res.status(403).json({ error: msg })
    return
  }

  if (new Date(delegation.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from('access_delegations')
      .update({ status: 'expired' })
      .eq('id', delegation.id)
    res.status(403).json({ error: 'This access link has expired.' })
    return
  }

  // Get owner display name
  const { data: owner } = await supabase
    .from('users')
    .select('creator_handle')
    .eq('id', delegation.owner_id)
    .single()

  const ownerName = owner?.creator_handle || 'the account owner'

  // Log link_opened
  await supabase.from('delegation_activity_log').insert({
    delegation_id: delegation.id,
    action: 'link_opened',
    ip_address: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
  })

  res.json({
    delegationId: delegation.id,
    delegateName: delegation.delegate_name,
    ownerName,
    platforms: delegation.platforms,
    vaultItemIds: delegation.vault_item_ids,
    expiresAt: delegation.expires_at,
  })
})

// POST /api/access/reveal — public, reveals password once
router.post('/reveal', async (req: Request, res: Response): Promise<void> => {
  const { token, vault_item_id } = req.body
  if (!token || !vault_item_id) { res.status(400).json({ error: 'token and vault_item_id required' }); return }

  const { data: delegation, error } = await supabase
    .from('access_delegations')
    .select('*')
    .eq('access_token', token)
    .single()

  if (error || !delegation) {
    res.status(404).json({ error: 'Invalid access link' })
    return
  }

  if (delegation.status !== 'active') {
    res.status(403).json({ error: 'This access link is no longer active.' })
    return
  }

  if (new Date(delegation.expires_at) < new Date()) {
    await supabase.from('access_delegations').update({ status: 'expired' }).eq('id', delegation.id)
    res.status(403).json({ error: 'This access link has expired.' })
    return
  }

  if (!delegation.vault_item_ids.includes(vault_item_id)) {
    res.status(403).json({ error: 'This item is not included in this delegation.' })
    return
  }

  // Check if already revealed in this delegation
  const { data: existingReveal } = await supabase
    .from('delegation_activity_log')
    .select('id, performed_at')
    .eq('delegation_id', delegation.id)
    .eq('action', 'password_revealed')
    .eq('detail', vault_item_id)
    .single()

  if (existingReveal) {
    res.status(409).json({
      error: 'already_revealed',
      message: `This password was already revealed at ${new Date(existingReveal.performed_at).toLocaleTimeString()}.`,
      revealedAt: existingReveal.performed_at,
    })
    return
  }

  // Fetch vault item
  const { data: vaultItem, error: vaultError } = await supabase
    .from('vault_files')
    .select('id, file_name, category')
    .eq('id', vault_item_id)
    .eq('user_id', delegation.owner_id)
    .single()

  if (vaultError || !vaultItem) {
    res.status(404).json({ error: 'Vault item not found' })
    return
  }

  // Log the reveal
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown'
  await supabase.from('delegation_activity_log').insert({
    delegation_id: delegation.id,
    action: 'password_revealed',
    platform: vaultItem.file_name,
    detail: vault_item_id,
    ip_address: ip,
  })

  res.json({
    vaultItemId: vault_item_id,
    fileName: vaultItem.file_name,
    note: 'In production, the decrypted credential would be returned here. This is a secure one-time reveal.',
    revealedAt: new Date().toISOString(),
  })
})

// PATCH /api/access/delegations/:id/password-changed — mark password changed
router.patch('/delegations/:id/password-changed', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('access_delegations')
    .update({ password_changed_after: true })
    .eq('id', req.params.id)
    .eq('owner_id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

export default router
