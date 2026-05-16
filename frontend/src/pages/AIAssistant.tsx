import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Bot, User, Sparkles, Lock, Shield, RefreshCw,
  Download, CheckCircle, AlertTriangle, ScanLine, Flag,
  Key, Eye, Smartphone,
} from 'lucide-react'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { hasFeature } from '@/lib/utils'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ActionCard {
  icon: LucideIcon
  title: string
  body: string
  cta?: { label: string; url: string }
}

interface ParsedResponse {
  tldr: string
  cards: ActionCard[]
}

const CARD_ICON_MAP: [RegExp, LucideIcon][] = [
  [/2fa|two.factor|authenticat/i, Smartphone],
  [/password|credential/i, Key],
  [/recover|reset|restore/i, RefreshCw],
  [/report|appeal|flag/i, Flag],
  [/backup|download|export/i, Download],
  [/check|review|audit|session|device/i, Eye],
  [/scan|phish/i, ScanLine],
  [/warn|alert|notify/i, AlertTriangle],
  [/secure|lock|protect/i, Lock],
  [/verify|confirm|complete/i, CheckCircle],
]

function iconForTitle(title: string): LucideIcon {
  for (const [pattern, Icon] of CARD_ICON_MAP) {
    if (pattern.test(title)) return Icon
  }
  return Shield
}

function parseResponse(content: string): ParsedResponse | null {
  const tldrMatch = content.match(/^TL;?DR:?\s*(.+)$/im)
  if (!tldrMatch) return null

  const cardMatches = [...content.matchAll(/\*\*([^*\n]+)\*\*\n([^\n]+)(?:\nCTA:\s*([^→\n]+)\s*→\s*([^\n]+))?/g)]
  if (cardMatches.length < 2) return null

  const cards: ActionCard[] = cardMatches.slice(0, 4).map((m) => ({
    icon: iconForTitle(m[1]),
    title: m[1].trim(),
    body: m[2].trim(),
    cta: m[3] ? { label: m[3].trim(), url: m[4].trim() } : undefined,
  }))

  return { tldr: tldrMatch[1].trim(), cards }
}

const SUGGESTED_PROMPTS = [
  'My Instagram was hacked, what do I do?',
  'How do I set up 2FA on TikTok?',
  'Someone is impersonating me online',
  'Is this brand deal email a scam?',
  'How do I change my password on Instagram?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuthStore()

  const hasAccess = hasFeature(user?.plan_tier || 'free', 'ai_assistant')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMessage: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aeforyn_token')}`,
        },
        body: JSON.stringify({ message: text, conversation_id: conversationId }),
      })

      if (!response.ok || !response.body) throw new Error('Stream failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let newConvId = conversationId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              fullContent += data.text
              setStreamingContent(fullContent)
            }
            if (data.done && data.conversation_id) {
              newConvId = data.conversation_id
            }
          } catch {}
        }
      }

      setConversationId(newConvId)
      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent, timestamp: new Date().toISOString() }])
      setStreamingContent('')
    } catch {
      const demoResponse = getDemoResponse(text)
      let i = 0
      const interval = setInterval(() => {
        i += 5
        setStreamingContent(demoResponse.slice(0, i))
        if (i >= demoResponse.length) {
          clearInterval(interval)
          setMessages((prev) => [...prev, { role: 'assistant', content: demoResponse, timestamp: new Date().toISOString() }])
          setStreamingContent('')
        }
      }, 15)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <h2 className="heading-section mb-3">AI Assistant — Standard Feature</h2>
        <p className="text-text-secondary mb-6">Upgrade to Standard or higher to access AEFORYN's AI security assistant.</p>
        <Link to="/billing"><button className="btn-primary">Upgrade — from R149/month</button></Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {messages.length === 0 && !streamingContent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
            <AeforynLogo size="lg" showWordmark={false} />
            <h2 className="heading-section mt-6 mb-2">Ask me anything about protecting your accounts.</h2>
            <p className="text-text-secondary text-sm mb-10">Your AI security expert, available 24/7.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="p-4 rounded-xl text-left text-sm text-text-primary transition-all hover:border-gold/30 group"
                  style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)' }}
                >
                  <Sparkles className="w-4 h-4 text-gold mb-2 group-hover:text-gold-light transition-colors" />
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #C9A84C, #9A7A35)' }
                  : { background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }
                }
              >
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-bg-primary" />
                  : <Bot className="w-4 h-4 text-teal" />
                }
              </div>

              {msg.role === 'user' ? (
                <div
                  className="max-w-[85%] rounded-2xl px-5 py-4"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}
                >
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <AssistantBubble content={msg.content} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {(streamingContent || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
              <Bot className="w-4 h-4 text-teal" />
            </div>
            <div className="flex-1 max-w-[85%] rounded-2xl px-5 py-4"
              style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.12)', borderLeft: '3px solid rgba(45,212,191,0.4)' }}>
              {streamingContent ? (
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.7' }}>
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-teal ml-0.5 animate-pulse" />
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((j) => (
                      <motion.div key={j} className="w-2 h-2 rounded-full bg-teal"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: j * 0.3 }} />
                    ))}
                  </div>
                  <span className="text-xs mono-text text-teal tracking-widest" style={{ letterSpacing: '2px' }}>AEFORYN is thinking...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 pt-4" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>
        <div className="flex items-end gap-3 p-4 rounded-2xl"
          style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.15)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about protecting your accounts..."
            className="flex-1 bg-transparent text-text-primary text-sm resize-none outline-none leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', minHeight: '24px', maxHeight: '120px' }}
            rows={1}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg, #C9A84C, #9A7A35)' : 'rgba(201,168,76,0.1)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <Send className="w-4 h-4" style={{ color: input.trim() && !loading ? '#071E1C' : '#9A7A35' }} />
          </button>
        </div>
        <p className="text-center text-xs text-text-secondary mt-2">
          AEFORYN AI can make mistakes. Always verify critical security steps.
        </p>
      </div>
    </div>
  )
}

function AssistantBubble({ content }: { content: string }) {
  const parsed = parseResponse(content)

  if (!parsed) {
    return (
      <div
        className="max-w-[85%] rounded-2xl px-5 py-4"
        style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.12)', borderLeft: '3px solid rgba(45,212,191,0.4)' }}
      >
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.7' }}>
          {content}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1" style={{ maxWidth: 680 }}>
      {/* TL;DR */}
      <div
        className="mb-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: '3px solid #2DD4BF' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#F0FDF4', lineHeight: 1.5 }}>
          <span style={{ color: '#2DD4BF', marginRight: 8 }}>TL;DR</span>
          {parsed.tldr}
        </p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {parsed.cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07 }}
              style={{
                background: '#0A2422',
                border: '1px solid rgba(45,212,191,0.1)',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(45,212,191,0.1)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#2DD4BF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#F0FDF4' }}>{card.title}</p>
                  <p className="text-sm" style={{ color: '#86EFAC', lineHeight: 1.55 }}>{card.body}</p>
                  {card.cta && (
                    <a
                      href={card.cta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ color: '#2DD4BF' }}
                    >
                      {card.cta.label} →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function getDemoResponse(question: string): string {
  const q = question.toLowerCase()

  if (q.includes('2fa') || q.includes('two-factor')) {
    return `TL;DR: Enable an authenticator app (not SMS) on every platform — this is the single highest-impact security action you can take.

**Enable an Authenticator App**
Download Google Authenticator or Authy, then link it to your account via the Security settings — it can't be SIM-swapped.

**Set Up 2FA on Instagram**
Profile → Settings → Security → Two-Factor Authentication → Authentication App, then scan the QR code.
CTA: Instagram 2FA Guide → https://help.instagram.com/566810106808145

**Save Your Backup Codes**
Every platform gives you one-time backup codes when you enable 2FA — store them in your AEFORYN vault now.

**Enable 2FA on Every Platform**
Repeat for TikTok, YouTube, Twitter/X, and any email account linked to your creator profiles.`
  }

  if (q.includes('phishing') || q.includes('scam') || q.includes('suspicious')) {
    return `TL;DR: Never click links from unexpected emails — verify through the platform's official app or website directly.

**Check the Sender Domain**
Hover over the sender's email address — legitimate platforms only send from their own domains (e.g. @youtube.com, not @youtube-creator.net).

**Spot Urgency and Pressure Tactics**
Real platforms give you weeks to respond — any email saying "your account will be deleted in 24 hours" is almost always a scam.

**Scan It With AEFORYN**
Paste the suspicious message or URL into the AEFORYN Scanner for an instant AI risk assessment.
CTA: Open Scanner → /scanner

**Never Enter Credentials via Email Links**
No legitimate company will ask you to log in through a link they send you — always navigate directly to the platform.`
  }

  if (q.includes('hacked') || q.includes('compromised') || q.includes('someone else')) {
    return `TL;DR: Change your password immediately, revoke all active sessions, then enable 2FA with an authenticator app.

**Change Your Password Right Now**
Do this on a trusted device — go directly to the platform's security settings and set a new strong password.

**Revoke All Active Sessions**
Find "Login Activity" or "Devices" in Security settings and log out every session you don't recognise.

**Secure Your Linked Email First**
Your email is the master key — if it's compromised, the attacker can reset any account linked to it.

**Use the Official Recovery Portal**
Use the platform's own recovery page — never pay third-party services claiming to recover your account.
CTA: Instagram Hacked Portal → https://www.instagram.com/hacked`
  }

  if (q.includes('impersonat')) {
    return `TL;DR: Document the fake account, report it directly on the platform, and warn your audience immediately.

**Document Everything First**
Screenshot the fake account's profile, bio, posts, and follower count before reporting — platforms may act quickly.

**Report via the Platform's Own Tool**
Visit the fake profile → three-dot menu → Report → Impersonation → "Me" — this is the fastest path to takedown.

**Alert Your Audience Now**
Post a Story and pinned post warning followers about the fake account before they get scammed.

**Apply for Verification**
A verified badge makes impersonation significantly harder and faster to resolve in future incidents.
CTA: Instagram Verification → https://help.instagram.com/854227311295302`
  }

  return `TL;DR: The most impactful things you can do right now are: a password manager, authenticator-based 2FA, and regular content backups.

**Use a Password Manager**
1Password or Bitwarden generate and store unique passwords per account — one breach can't expose everything else.

**Enable 2FA Everywhere**
Use an authenticator app (not SMS) on every platform linked to your creator income.

**Back Up Your Content**
Upload your most important content to your encrypted AEFORYN vault regularly — lost posts are often unrecoverable.
CTA: Open Vault → /vault

**Scan Suspicious Messages**
If you receive a suspicious DM or brand deal email, paste it into the AEFORYN Scanner before acting on it.
CTA: Open Scanner → /scanner`
}
