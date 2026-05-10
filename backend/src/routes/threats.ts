import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { severity, resolved, limit = '50', offset = '0' } = req.query
  let query = supabase.from('threats_log').select('*').eq('user_id', req.userId!).order('detected_at', { ascending: false })

  if (severity) query = query.eq('severity', severity)
  if (resolved !== undefined) query = query.eq('is_resolved', resolved === 'true')
  query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

  const { data, error } = await query
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { threat_type, platform, severity, title, description, location } = req.body
  const { data, error } = await supabase.from('threats_log').insert({
    user_id: req.userId!,
    threat_type,
    platform,
    severity,
    title,
    description,
    location,
  }).select().single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.patch('/:id/resolve', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('threats_log')
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.get('/summary', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('threats_log')
    .select('severity, is_resolved')
    .eq('user_id', req.userId!)

  const summary = {
    critical: 0, high: 0, medium: 0, low: 0, total: 0, resolved: 0,
  }

  data?.forEach((t) => {
    summary.total++
    if (t.is_resolved) summary.resolved++
    else summary[t.severity as keyof typeof summary] = (summary[t.severity as keyof typeof summary] as number) + 1
  })

  res.json(summary)
})

export default router
