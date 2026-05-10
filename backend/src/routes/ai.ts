import { Router, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth, requirePlan, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are AEFORYN's AI security assistant — built for creators, influencers, and freelancers who rely on their social media accounts for their income. Help them protect their accounts, identify threats, and recover from security incidents. Speak like a knowledgeable friend — clear, direct, never use jargon or corporate tone. Be empowering not alarmist. You know Instagram, TikTok, YouTube, X, LinkedIn, and email security deeply. Always give actionable advice. If someone is in a security emergency, give the most important step first immediately.`

router.post('/chat', requireAuth, requirePlan(['standard', 'pro', 'enterprise']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { message, conversation_id } = req.body
  if (!message?.trim()) { res.status(400).json({ error: 'Message required' }); return }

  let conversation = null
  let messages: Array<{ role: string; content: string; timestamp: string }> = []

  if (conversation_id) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', req.userId!)
      .single()
    if (data) {
      conversation = data
      messages = data.messages || []
    }
  }

  const newUserMessage = { role: 'user', content: message, timestamp: new Date().toISOString() }
  messages.push(newUserMessage)

  const anthropicMessages = messages.slice(-20).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let fullResponse = ''

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages,
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullResponse += event.delta.text
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
    }
  }

  const assistantMessage = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() }
  messages.push(assistantMessage)

  let savedConvId = conversation_id
  if (conversation) {
    await supabase.from('ai_conversations').update({ messages, updated_at: new Date().toISOString() }).eq('id', conversation.id)
  } else {
    const { data: newConv } = await supabase.from('ai_conversations').insert({
      user_id: req.userId!,
      messages,
    }).select().single()
    savedConvId = newConv?.id
  }

  res.write(`data: ${JSON.stringify({ done: true, conversation_id: savedConvId })}\n\n`)
  res.end()
})

router.get('/conversations', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase
    .from('ai_conversations')
    .select('id, created_at, updated_at, messages')
    .eq('user_id', req.userId!)
    .order('updated_at', { ascending: false })
    .limit(10)
  res.json(data || [])
})

export default router
