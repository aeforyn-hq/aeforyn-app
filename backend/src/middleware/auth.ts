import { Request, Response, NextFunction } from 'express'
import { supabase } from '../db/supabase.js'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userPlan?: string
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan_tier')
    .eq('id', user.id)
    .single()

  req.userId = user.id
  req.userEmail = user.email
  req.userPlan = profile?.plan_tier || 'free'
  next()
}

export function requirePlan(plans: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userPlan || !plans.includes(req.userPlan)) {
      res.status(403).json({ error: 'This feature requires a higher plan', required_plans: plans })
      return
    }
    next()
  }
}
