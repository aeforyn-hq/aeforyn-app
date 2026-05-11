import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { PLAN_LIMITS } from '../config/planLimits.js'

const router = Router()

router.get('/platforms', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('platforms_connected')
    .select('*')
    .eq('user_id', req.userId!)
    .order('connected_at', { ascending: false })
  res.json(data || [])
})

router.post('/platforms', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform, handle } = req.body
  const { data: existing } = await supabase
    .from('platforms_connected')
    .select('id')
    .eq('user_id', req.userId!)
    .eq('platform', platform)
    .single()

  if (existing) { res.status(400).json({ error: 'Platform already connected' }); return }

  // Enforce plan platform limits
  const planTier = (req.userPlan || 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.free
  if (limits.max_platforms !== -1) {
    const { count } = await supabase
      .from('platforms_connected')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId!)
    if ((count ?? 0) >= limits.max_platforms) {
      res.status(403).json({ error: `Your plan allows a maximum of ${limits.max_platforms} platform${limits.max_platforms === 1 ? '' : 's'}. Upgrade to add more.` })
      return
    }
  }

  const { data, error } = await supabase.from('platforms_connected').insert({
    user_id: req.userId!,
    platform,
    handle,
    health_score: Math.floor(Math.random() * 30) + 60,
    status: 'monitoring',
    last_checked_at: new Date().toISOString(),
  }).select().single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.delete('/platforms/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  await supabase.from('platforms_connected').delete().eq('id', req.params.id).eq('user_id', req.userId!)
  res.json({ message: 'Platform disconnected' })
})

router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const [platformsRes, threatsRes, filesRes, userRes] = await Promise.all([
    supabase.from('platforms_connected').select('*').eq('user_id', req.userId!),
    supabase.from('threats_log').select('*').eq('user_id', req.userId!).eq('is_resolved', false).order('detected_at', { ascending: false }).limit(5),
    supabase.from('vault_files').select('*').eq('user_id', req.userId!).order('uploaded_at', { ascending: false }).limit(5),
    supabase.from('users').select('storage_used_bytes, plan_tier').eq('id', req.userId!).single(),
  ])

  const allThreats = await supabase.from('threats_log').select('severity, is_resolved').eq('user_id', req.userId!)
  const threatsSummary = { critical: 0, high: 0, medium: 0, low: 0, total: 0, resolved: 0 }
  allThreats.data?.forEach((t) => {
    threatsSummary.total++
    if (t.is_resolved) threatsSummary.resolved++
    else threatsSummary[t.severity as keyof typeof threatsSummary] = (threatsSummary[t.severity as keyof typeof threatsSummary] as number) + 1
  })

  const platforms = platformsRes.data || []
  const avgHealth = platforms.length > 0 ? Math.round(platforms.reduce((s, p) => s + p.health_score, 0) / platforms.length) : 0
  const planLimitMap: Record<string, number> = { free: 2147483648, standard: 10737418240, pro: 53687091200, enterprise: 214748364800 }
  const planTier = userRes.data?.plan_tier || 'free'

  res.json({
    security_score: avgHealth || 75,
    threats_summary: threatsSummary,
    platforms,
    recent_threats: threatsRes.data || [],
    recent_files: filesRes.data || [],
    storage_used: userRes.data?.storage_used_bytes || 0,
    storage_total: planLimitMap[planTier],
  })
})

export default router
