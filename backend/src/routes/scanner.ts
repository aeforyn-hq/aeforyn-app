import { Router, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'
import { PLAN_LIMITS } from '../config/planLimits.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

router.post('/scan', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { text } = req.body
  if (!text?.trim()) { res.status(400).json({ error: 'Text to scan is required' }); return }

  const planLimits = PLAN_LIMITS[req.userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('scan_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.userId!)
    .gte('scanned_at', startOfMonth)

  if ((count || 0) >= planLimits.monthly_scans) {
    res.status(403).json({ error: `Monthly scan limit reached (${planLimits.monthly_scans} scans). Upgrade your plan.` })
    return
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a cybersecurity expert specialising in social media scams targeting content creators. Analyse the following text for phishing, social engineering, fake brand deal, and scam indicators. Return ONLY valid JSON (no markdown, no explanation outside the JSON) with: risk_level (exactly 'low', 'medium', or 'high'), confidence_score (integer 0-100), red_flags (array of strings, each one specific issue found), explanation (plain English max 3 sentences, zero jargon, written for a creator not an IT professional), recommendation (one clear action to take right now). Text to analyse:\n\n${text}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') { res.status(500).json({ error: 'AI response error' }); return }

  let result: { risk_level: string; confidence_score: number; red_flags: string[]; explanation: string; recommendation: string }
  try {
    result = JSON.parse(content.text)
  } catch {
    res.status(500).json({ error: 'Failed to parse AI response' })
    return
  }

  const { data, error } = await supabase.from('scan_results').insert({
    user_id: req.userId!,
    input_text: text,
    risk_level: result.risk_level,
    confidence_score: result.confidence_score,
    red_flags: result.red_flags,
    explanation: result.explanation,
    recommendation: result.recommendation,
  }).select().single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.get('/history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('scan_results')
    .select('*')
    .eq('user_id', req.userId!)
    .order('scanned_at', { ascending: false })
    .limit(10)
  res.json(data || [])
})

export default router
