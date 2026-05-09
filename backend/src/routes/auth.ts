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

  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      creator_handle: creator_handle || null,
      platforms_connected: platforms || [],
      plan_tier: 'free',
    })
  }

  res.json({ message: 'Account created. Check your email to verify.', user_id: data.user?.id })
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
