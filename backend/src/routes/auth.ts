import { Router, Request, Response } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password, creator_handle, platforms } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' })
    return
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: data.user.id,
    email,
    creator_handle: creator_handle || null,
    platforms_connected: Array.isArray(platforms) ? platforms : [],
    plan_tier: 'free',
    storage_used_bytes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (insertError) {
    // Auth user was created but profile insert failed — clean up the dangling auth user
    await supabase.auth.admin.deleteUser(data.user.id)
    res.status(500).json({ error: 'Failed to create user profile. Please try again.' })
    return
  }

  res.json({ message: 'Account created. Check your email to verify.', user_id: data.user.id })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    res.status(401).json({ error: error.message })
    return
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: profile,
  })
})

router.post('/logout', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ message: 'Logged out' })
})

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json({ message: 'Password reset email sent' })
})

router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body
  if (!current_password || !new_password) {
    res.status(400).json({ error: 'current_password and new_password required' }); return
  }
  if (new_password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' }); return
  }

  const { data: adminData } = await supabase.auth.admin.getUserById(req.userId!)
  if (!adminData.user?.email) {
    res.status(404).json({ error: 'User not found' }); return
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: adminData.user.email,
    password: current_password,
  })
  if (verifyError) {
    res.status(401).json({ error: 'Current password is incorrect' }); return
  }

  const { error } = await supabase.auth.admin.updateUserById(req.userId!, { password: new_password })
  if (error) {
    res.status(500).json({ error: error.message }); return
  }

  res.json({ message: 'Password updated successfully' })
})

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .eq('id', req.userId!)
    .single()

  if (error) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json(data)
})

export default router
