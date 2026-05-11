import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, Shield, AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { RiskBadge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { getRiskColor, timeAgo, truncate } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import type { ScanResult } from '@/types'

const SAMPLE_TEXTS = [
  {
    label: 'Fake brand deal',
    text: `Hi! I'm Sarah from BrandCollab Media. We love your content and want to offer you a $3,500 paid partnership with our client. We need your PayPal email to send the advance payment immediately. Please also send us your Instagram login so we can post directly from your account. Reply ASAP — offer expires today!`,
  },
  {
    label: 'YouTube account threat',
    text: `URGENT: Your YouTube channel has been flagged for copyright violations. Your channel will be permanently deleted in 24 hours unless you verify your account. Click here immediately: youtube-creator-support-verification.net/verify?id=28947 and enter your Google login to prevent deletion.`,
  },
  {
    label: 'Legitimate collab DM',
    text: `Hi! I work at Nike's creator partnerships team. We'd love to collaborate with you on our upcoming campaign. Our official email is partnerships@nike.com — feel free to verify us on LinkedIn or the Nike website. No payment upfront needed, we'll discuss terms via official channels. Looking forward to connecting!`,
  },
]

const DEMO_HISTORY: ScanResult[] = [
  { id: '1', user_id: 'demo', input_text: 'URGENT: Your YouTube channel has been flagged...', risk_level: 'high', confidence_score: 97, red_flags: ['Urgency tactic', 'Fake domain', 'Credential harvesting'], explanation: 'This is a phishing attempt designed to steal your Google login. The URL is not a real YouTube domain.', recommendation: 'Do not click the link. Delete the message immediately.', scanned_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
  { id: '2', user_id: 'demo', input_text: 'Hi! I\'m Sarah from BrandCollab Media...', risk_level: 'high', confidence_score: 94, red_flags: ['Requests login credentials', 'Asks for PayPal upfront', 'Unusual urgency'], explanation: 'Legitimate brands never ask for your account login or PayPal email in an initial outreach message.', recommendation: 'Do not respond or share any information. Block and report the sender.', scanned_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: '3', user_id: 'demo', input_text: 'Hi! I work at Nike\'s creator partnerships team...', risk_level: 'low', confidence_score: 91, red_flags: [], explanation: 'This message shows typical markers of a legitimate brand outreach. The email domain is verifiable and no sensitive information is requested upfront.', recommendation: 'Proceed with normal due diligence — verify the contact on LinkedIn and the company website before engaging.', scanned_at: new Date(Date.now() - 1000*60*60*48).toISOString() },
]

export default function PhishingScanner() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { data: history = DEMO_HISTORY } = useQuery({
    queryKey: ['scan-history'],
    queryFn: async () => {
      const { data } = await api.get<ScanResult[]>('/api/scanner/history')
      return data
    },
    placeholderData: DEMO_HISTORY,
  })

  const scanMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post<ScanResult>('/api/scanner/scan', { text })
      return data
    },
    onSuccess: (data) => {
      setResult(data)
    },
    onError: () => {
      toast.error('Scan failed', 'Something went wrong. Your data is safe — try again.')
    },
  })

  const handleScan = () => {
    if (!inputText.trim()) { toast.error('Please paste some text to scan'); return }
    scanMutation.mutate(inputText)
  }

  const riskColors = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-text-secondary text-lg leading-relaxed">
          Paste any suspicious message, email, DM, or link. We'll analyse it with AI in seconds.
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-static space-y-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste suspicious content here — a DM, email, brand deal offer, or link..."
          className="mono-text text-sm min-h-[180px] resize-y"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}
        />

        {/* Sample texts */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-secondary">Try a sample:</span>
          {SAMPLE_TEXTS.map((s) => (
            <button
              key={s.label}
              onClick={() => { setInputText(s.text); setResult(null) }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={handleScan}
          loading={scanMutation.isPending}
          disabled={!inputText.trim()}
        >
          <ScanLine className="w-5 h-5" />
          {scanMutation.isPending ? 'ANALYSING WITH AI...' : 'Scan Now'}
        </Button>
      </motion.div>

      {/* Scanning animation */}
      <AnimatePresence>
        {scanMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-static text-center py-10"
          >
            <div className="w-24 h-24 mx-auto mb-5 relative flex items-center justify-center">
              {/* Outer pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(245,158,11,0.12)' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              {/* Mid pulse ring */}
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
              {/* Shield container */}
              <motion.div
                className="relative w-16 h-16 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.5)' }}
                animate={{ boxShadow: ['0 0 12px rgba(245,158,11,0.3)', '0 0 32px rgba(245,158,11,0.65)', '0 0 12px rgba(245,158,11,0.3)'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Shield className="w-8 h-8" style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.7))' }} />
                </motion.div>
              </motion.div>
            </div>
            <p className="mono-text text-sm tracking-widest" style={{ letterSpacing: '3px', color: '#F59E0B' }}>SCANNING FOR THREATS...</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {[0,1,2].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }}
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-4">Analysing with Claude AI for phishing indicators...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !scanMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="card-static space-y-6"
            style={{ borderColor: `${riskColors[result.risk_level]}30`, borderWidth: '1px' }}
          >
            {/* Risk level header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2" style={{ letterSpacing: '1.5px' }}>Risk Assessment</p>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: riskColors[result.risk_level], lineHeight: 1, letterSpacing: '-1px' }}>
                  {result.risk_level.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: `${riskColors[result.risk_level]}10`, border: `2px solid ${riskColors[result.risk_level]}30` }}>
                  {result.risk_level === 'low'
                    ? <Shield className="w-10 h-10 text-safe" />
                    : <AlertTriangle className="w-10 h-10" style={{ color: riskColors[result.risk_level] }} />
                  }
                </div>
                <p className="text-xs mono-text mt-2" style={{ color: riskColors[result.risk_level] }}>
                  {result.confidence_score}% confidence
                </p>
              </div>
            </div>

            {/* Red flags */}
            {result.red_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3" style={{ letterSpacing: '1.5px' }}>Red Flags Detected</p>
                <div className="flex flex-wrap gap-2">
                  {result.red_flags.map((flag, i) => (
                    <span key={i} className="badge-threat">{flag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2" style={{ letterSpacing: '1.5px' }}>What we found</p>
              <p className="text-base text-text-primary leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {result.explanation}
              </p>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2" style={{ letterSpacing: '1.5px' }}>What to do right now</p>
              <p className="text-base text-text-primary font-medium leading-relaxed">{result.recommendation}</p>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => { setResult(null); setInputText('') }}>
              Scan another message
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan history */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all"
            style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}
          >
            <span className="text-sm font-medium text-text-primary">Recent Scans ({history.length})</span>
            {historyOpen ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
          </button>

          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2">
                  {history.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                      style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.06)' }}
                      onClick={() => { setResult(scan); setInputText(scan.input_text) }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getRiskColor(scan.risk_level) }} />
                      <p className="flex-1 text-sm text-text-primary truncate">{truncate(scan.input_text, 80)}</p>
                      <RiskBadge risk={scan.risk_level} />
                      <span className="flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap">
                        <Clock className="w-3 h-3" /> {timeAgo(scan.scanned_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
