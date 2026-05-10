import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { hasFeature } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  'How do I enable 2FA on Instagram?',
  'What does a phishing email look like?',
  'Someone logged in from another country — what do I do?',
  "What's the safest password manager for creators?",
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
      // Fallback demo response when API unavailable
      const demoResponse = getDemoResponse(text)
      let i = 0
      const interval = setInterval(() => {
        i += 3
        setStreamingContent(demoResponse.slice(0, i))
        if (i >= demoResponse.length) {
          clearInterval(interval)
          setMessages((prev) => [...prev, { role: 'assistant', content: demoResponse, timestamp: new Date().toISOString() }])
          setStreamingContent('')
        }
      }, 20)
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
        <Link to="/billing"><button className="btn-primary">Upgrade — from $29/month</button></Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Empty state */}
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
                  style={{ background: '#0C1A0F', border: '1px solid rgba(201,168,76,0.15)' }}
                >
                  <Sparkles className="w-4 h-4 text-gold mb-2 group-hover:text-gold-light transition-colors" />
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
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

              {/* Bubble */}
              <div
                className="max-w-[85%] rounded-2xl px-5 py-4"
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#050D0A' }
                  : { background: '#0C1A0F', border: '1px solid rgba(45,212,191,0.12)', borderLeft: '3px solid rgba(45,212,191,0.4)' }
                }
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-bg-primary font-medium' : 'text-text-primary'}`}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: msg.role === 'assistant' ? '15px' : '14px', lineHeight: '1.7' }}
                >
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {(streamingContent || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
              <Bot className="w-4 h-4 text-teal" />
            </div>
            <div className="max-w-[85%] rounded-2xl px-5 py-4"
              style={{ background: '#0C1A0F', border: '1px solid rgba(45,212,191,0.12)', borderLeft: '3px solid rgba(45,212,191,0.4)' }}>
              {streamingContent ? (
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.7' }}>
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-teal ml-0.5 animate-pulse" />
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-teal"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
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

      {/* Input bar */}
      <div className="flex-shrink-0 pt-4" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>
        <div className="flex items-end gap-3 p-4 rounded-2xl"
          style={{ background: '#0C1A0F', border: '1px solid rgba(45,212,191,0.15)' }}>
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
            <Send className="w-4 h-4" style={{ color: input.trim() && !loading ? '#050D0A' : '#9A7A35' }} />
          </button>
        </div>
        <p className="text-center text-xs text-text-secondary mt-2">
          AEFORYN AI can make mistakes. Always verify critical security steps.
        </p>
      </div>
    </div>
  )
}

function getDemoResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('2fa') || q.includes('two-factor')) {
    return `Great question! Two-factor authentication (2FA) is one of the most important things you can do to protect your accounts.\n\nFor Instagram specifically:\n1. Go to your profile and tap the hamburger menu (≡)\n2. Tap Settings → Security → Two-Factor Authentication\n3. Tap "Get Started"\n4. Choose "Authentication App" — this is much more secure than SMS\n5. Download Google Authenticator or Authy if you don't have it\n6. Scan the QR code Instagram shows you\n7. **Save your backup codes** somewhere safe — I'd recommend uploading them to your AEFORYN vault\n\nThe authenticator app method can't be SIM-swapped, which is a real risk for creators with public phone numbers. Do this for all your platforms — not just Instagram.`
  }
  if (q.includes('phishing') || q.includes('scam')) {
    return `Phishing emails targeting creators usually have a few telltale signs:\n\n🚩 **Urgency** — "Your account will be deleted in 24 hours!" Real platforms give you weeks to respond.\n\n🚩 **Suspicious domains** — The email comes from youtube-creator-support.net instead of youtube.com. Always check the full domain.\n\n🚩 **Requests for your login** — No legitimate company will ever ask for your password or ask you to "verify" by logging in through a link they send you.\n\n🚩 **Too-good-to-be-true offers** — "$5,000 brand deal, reply today!" Legitimate brands don't work like this.\n\nIf you get something suspicious, you can paste it into the AEFORYN Scanner and we'll analyse it with AI in seconds.`
  }
  if (q.includes('another country') || q.includes('unrecognised login')) {
    return `That's urgent — act immediately.\n\n**Right now:**\n1. Change your password for that account immediately (don't wait)\n2. Go to the account's "Login Activity" or "Active Sessions" section and log out every session except the one you're currently in\n3. Enable 2FA if it's not already on — use an authenticator app\n\n**Then check:**\n- Did they change your recovery email or phone number? Update it back.\n- Were any posts made or settings changed? Revert them.\n- Check connected apps — remove anything suspicious.\n\nIf you can't log in at all, that means they've already changed your password. Use the account's official recovery page (e.g., instagram.com/hacked) — never use third-party recovery services.\n\nWant me to walk you through the full recovery process for a specific platform?`
  }
  return `Good question! Here's what you need to know:\n\nFor creators who depend on their social accounts for income, security isn't optional — it's as important as your content strategy.\n\nThe most important things you can do right now:\n\n1. **Use a password manager** — 1Password and Bitwarden are both excellent. They generate and store unique passwords for every account, so one breach can't expose everything.\n\n2. **Enable 2FA everywhere** — Use an authenticator app (not SMS) for all your platforms.\n\n3. **Back up your content** — Your AEFORYN vault is encrypted and secure. Upload your most important content regularly.\n\n4. **Scan suspicious messages** — If you get a suspicious DM or email, paste it into the AEFORYN Scanner before acting on it.\n\nIs there a specific platform or situation you'd like more detail on?`
}
