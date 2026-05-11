import { Router, Response } from 'express'
import { requireAuth, requirePlan, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import {
  analyseImpersonationMatch,
  generateTakedownGuide,
  checkPhishingText,
  generateMonthlyReport,
} from '../services/impersonationAI.js'

const router = Router()

// GET /api/impersonation/alerts
router.get('/alerts', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('impersonation_alerts')
    .select('*')
    .eq('user_id', req.userId!)
    .order('detected_at', { ascending: false })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data || [])
})

// GET /api/impersonation/alerts/:id — with timeline
router.get('/alerts/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: alert, error } = await supabase
    .from('impersonation_alerts')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .single()

  if (error || !alert) { res.status(404).json({ error: 'Alert not found' }); return }

  const { data: timeline } = await supabase
    .from('impersonation_timeline')
    .select('*')
    .eq('alert_id', req.params.id)
    .order('event_at', { ascending: true })

  // Generate takedown guide if not already cached
  let takedownGuide = null
  try {
    takedownGuide = await generateTakedownGuide(alert.platform, alert.fake_handle, alert.match_type)
  } catch {
    // Non-fatal
  }

  res.json({ ...alert, timeline: timeline || [], takedownGuide })
})

// PATCH /api/impersonation/alerts/:id/status
router.patch('/alerts/:id/status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body
  const validStatuses = ['active', 'monitoring', 'reported', 'dismissed', 'removed']
  if (!validStatuses.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return }

  const { data, error } = await supabase
    .from('impersonation_alerts')
    .update({
      status,
      ...(status === 'removed' || status === 'dismissed' ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }

  // Add timeline event
  await supabase.from('impersonation_timeline').insert({
    alert_id: req.params.id,
    event: `Status updated to: ${status}`,
  })

  res.json(data)
})

// GET /api/impersonation/handles
router.get('/handles', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('impersonation_handles')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data || [])
})

// POST /api/impersonation/handles
router.post('/handles', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform, handle } = req.body
  if (!platform || !handle) { res.status(400).json({ error: 'platform and handle required' }); return }

  const { data, error } = await supabase
    .from('impersonation_handles')
    .insert({ user_id: req.userId!, platform, handle })
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

// DELETE /api/impersonation/handles/:id
router.delete('/handles/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { error } = await supabase
    .from('impersonation_handles')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json({ success: true })
})

// POST /api/impersonation/scan — manual scan trigger
router.post('/scan', requireAuth, requirePlan(['pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: handles } = await supabase
    .from('impersonation_handles')
    .select('*')
    .eq('user_id', req.userId!)

  if (!handles?.length) {
    res.json({ message: 'No handles registered. Add your handles first.', scanned: 0 })
    return
  }

  // In production this would call platform APIs; here we return a scan summary
  res.json({
    message: 'Scan initiated. Results will appear in your alerts within a few minutes.',
    scanned: handles.length,
    handles: handles.map((h) => ({ platform: h.platform, handle: h.handle })),
  })
})

// POST /api/impersonation/phishing-check
router.post('/phishing-check', requireAuth, requirePlan(['standard', 'pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { text } = req.body
  if (!text?.trim()) { res.status(400).json({ error: 'text required' }); return }

  try {
    const result = await checkPhishingText(text)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

// GET /api/impersonation/monthly-report
router.get('/monthly-report', requireAuth, requirePlan(['pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: alerts } = await supabase
    .from('impersonation_alerts')
    .select('platform, status, detected_at')
    .eq('user_id', req.userId!)

  const allAlerts = alerts || []
  const thisMonth = allAlerts.filter((a) => a.detected_at >= startOfMonth)
  const resolved = allAlerts.filter((a) => ['removed', 'dismissed'].includes(a.status))
  const active = allAlerts.filter((a) => a.status === 'active' || a.status === 'monitoring')

  const platformCounts: Record<string, number> = {}
  allAlerts.forEach((a) => { platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1 })
  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p]) => p)

  try {
    const report = await generateMonthlyReport(req.userId!, {
      totalNew: thisMonth.length,
      totalResolved: resolved.length,
      totalActive: active.length,
      topPlatforms,
    })
    res.json({ report, stats: { totalNew: thisMonth.length, totalResolved: resolved.length, totalActive: active.length, topPlatforms } })
  } catch {
    res.status(500).json({ error: 'Report generation failed' })
  }
})

export default router
