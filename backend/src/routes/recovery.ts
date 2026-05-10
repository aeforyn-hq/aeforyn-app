import { Router, Response } from 'express'
import { requireAuth, requirePlan, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { RECOVERY_PLAYBOOKS, getPlaybook } from '../config/playbooks.js'

const router = Router()

router.get('/playbooks', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  const summary = RECOVERY_PLAYBOOKS.map((p) => ({
    platform: p.platform,
    incident_type: p.incident_type,
    title: p.title,
    description: p.description,
    total_steps: p.steps.length,
  }))
  res.json(summary)
})

router.get('/playbooks/:platform/:incident', requireAuth, requirePlan(['pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const playbook = getPlaybook(String(req.params.platform), String(req.params.incident))
  if (!playbook) { res.status(404).json({ error: 'Playbook not found' }); return }
  res.json(playbook)
})

router.post('/sessions', requireAuth, requirePlan(['pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform, incident_type } = req.body
  const playbook = getPlaybook(platform, incident_type)
  if (!playbook) { res.status(404).json({ error: 'No playbook found for this platform/incident combination' }); return }

  const { data, error } = await supabase.from('recovery_sessions').insert({
    user_id: req.userId!,
    platform,
    incident_type,
    steps_completed: 0,
    total_steps: playbook.steps.length,
    status: 'in_progress',
  }).select().single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json({ session: data, playbook })
})

router.patch('/sessions/:id/step', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { steps_completed } = req.body
  const { data, error } = await supabase
    .from('recovery_sessions')
    .update({ steps_completed })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.post('/sessions/:id/complete', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: session } = await supabase
    .from('recovery_sessions')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .single()

  if (!session) { res.status(404).json({ error: 'Session not found' }); return }

  const playbook = getPlaybook(session.platform, session.incident_type)
  const incidentReport = {
    session_id: session.id,
    platform: session.platform,
    incident_type: session.incident_type,
    started_at: session.started_at,
    completed_at: new Date().toISOString(),
    steps_completed: session.steps_completed,
    total_steps: session.total_steps,
    playbook_title: playbook?.title,
    time_taken_minutes: Math.round((Date.now() - new Date(session.started_at).getTime()) / 60000),
  }

  const { data, error } = await supabase
    .from('recovery_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString(), incident_report: incidentReport })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json({ session: data, incident_report: incidentReport })
})

router.get('/sessions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('recovery_sessions')
    .select('*')
    .eq('user_id', req.userId!)
    .order('started_at', { ascending: false })
  res.json(data || [])
})

export default router
