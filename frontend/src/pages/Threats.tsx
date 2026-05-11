// Demo data for when API is not connected
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, CheckCircle, Clock, MapPin, AlertTriangle, Bot, Lock, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/StatusDot'
import { SeverityBadge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { timeAgo, PLATFORM_LABELS, hasFeature } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import type { Threat } from '@/types'

const DEMO_THREATS: Threat[] = [
  { id: '1', user_id: 'demo', threat_type: 'login_attempt', platform: 'instagram', severity: 'critical', title: 'Login attempt from Lagos, Nigeria', description: 'An unrecognised device attempted to log in to your Instagram account. The attempt was blocked by two-factor authentication.', location: 'Lagos, Nigeria', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*15).toISOString() },
  { id: '2', user_id: 'demo', threat_type: 'phishing', platform: 'email', severity: 'critical', title: 'Phishing email impersonating YouTube', description: 'Email from "noreply@youtube-creator-support.net" claiming your channel is at risk of deletion. This is a phishing attempt.', location: 'Email', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*45).toISOString() },
  { id: '3', user_id: 'demo', threat_type: 'phishing', platform: 'email', severity: 'high', title: 'Brand deal phishing email detected', description: 'Email from "partnerships@brands-hub.co" offering $5,000 brand deal — confirmed phishing attempt targeting creators.', location: 'Email', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
  { id: '4', user_id: 'demo', threat_type: 'account_takeover', platform: 'x', severity: 'high', title: 'Unrecognised login on X (Twitter)', description: 'Your X account was accessed from a new device in São Paulo, Brazil. If this wasn\'t you, secure your account immediately.', location: 'São Paulo, Brazil', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*5).toISOString() },
  { id: '5', user_id: 'demo', threat_type: 'suspicious_access', platform: 'tiktok', severity: 'medium', title: 'Unusual login time on TikTok', description: 'TikTok login at 3:47 AM from your usual device in Cape Town. Unusual timing flagged.', location: 'Cape Town, ZA', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*8).toISOString() },
  { id: '6', user_id: 'demo', threat_type: 'data_breach', platform: 'email', severity: 'medium', title: 'Email found in data breach', description: 'Your email address appeared in the "DataCo Breach 2024" leak. Change any passwords shared with that service.', location: 'Breach Database', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: '7', user_id: 'demo', threat_type: 'login_attempt', platform: 'youtube', severity: 'low', title: 'Failed login to YouTube', description: 'A single failed login attempt on your YouTube channel. No action needed unless attempts continue.', location: 'Unknown', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*36).toISOString() },
  { id: '8', user_id: 'demo', threat_type: 'phishing', platform: 'instagram', severity: 'high', title: 'Fake collaboration DM', description: 'Instagram DM from @brands_deals_official offering a paid partnership. Account created 3 days ago — confirmed scam.', location: 'Instagram DM', is_resolved: true, detected_at: new Date(Date.now() - 1000*60*60*48).toISOString(), resolved_at: new Date(Date.now() - 1000*60*60*47).toISOString() },
]

const TABS = ['all', 'critical', 'high', 'medium', 'low', 'resolved'] as const
type Tab = typeof TABS[number]

const AI_RESOLUTION_STEPS: Record<string, string[]> = {
  login_attempt: [
    'Go to your account Security Settings immediately',
    'Review all active sessions and revoke any you don\'t recognise',
    'Change your password to a strong, unique one (16+ chars)',
    'Enable or verify two-factor authentication (use an authenticator app, not SMS)',
    'Check your recovery email and phone number — attackers often change these',
    'Review account activity logs for any unauthorised actions',
    'Alert your audience if your account was used to post anything suspicious',
  ],
  phishing: [
    'Do NOT click any links or download attachments from the suspicious message',
    'Report the message as phishing to the platform',
    'Block and report the sender',
    'Check if you accidentally clicked anything — if so, run a security scan',
    'If you entered credentials, change your password immediately on that platform',
    'Enable 2FA on affected accounts',
    'Forward phishing emails to reportphishing@apwg.org for reporting',
  ],
  account_takeover: [
    'Use the platform\'s official account recovery process (do not use links in emails)',
    'Verify your identity using backup codes, phone, or trusted devices',
    'Once recovered, immediately change your password',
    'Revoke all active sessions across all devices',
    'Re-enable 2FA with a new authenticator app enrollment',
    'Check for any posts, DMs, or changes made by the attacker',
    'Notify followers if the attacker used your account to scam them',
  ],
  suspicious_access: [
    'Review the device and location of the suspicious login in your security settings',
    'If you don\'t recognise the session, revoke it immediately',
    'Change your password as a precaution',
    'Check if your email used for that account has been compromised',
    'Verify your recovery methods haven\'t been tampered with',
    'Enable login notifications to be alerted of future logins',
  ],
  data_breach: [
    'Change the password for the breached service immediately',
    'If you reused that password anywhere else, change it on all those accounts too',
    'Enable 2FA on any accounts where the breached password was used',
    'Check haveibeenpwned.com for a full breach history for your email',
    'Monitor your bank statements if financial data may have been exposed',
    'Consider using a password manager to generate unique passwords',
  ],
  impersonation: [
    'Report the impersonating account to the platform using the official report tool',
    'Screenshot and document the fake account before it is removed',
    'Post a notice to your genuine audience warning them about the fake account',
    'Include the fake account\'s username in your bio or pinned post temporarily',
    'Apply for a verification badge on platforms where you qualify',
    'Monitor for additional impersonation accounts using AEFORYN\'s scan',
  ],
}

export default function Threats() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const { user } = useAuthStore()
  const isProUser = hasFeature(user?.plan_tier || 'free', 'ai_assistant')
  const queryClient = useQueryClient()

  const { data: threats = DEMO_THREATS } = useQuery({
    queryKey: ['threats'],
    queryFn: async () => {
      const { data } = await api.get<Threat[]>('/api/threats')
      return data
    },
    placeholderData: DEMO_THREATS,
  })

  async function openAIResolution(threat: Threat) {
    if (!isProUser) { setAiPanelOpen(true); return }
    setAiPanelOpen(true)
    setAiLoading(true)
    setAiSteps([])
    await new Promise(r => setTimeout(r, 800))
    const steps = AI_RESOLUTION_STEPS[threat.threat_type] || AI_RESOLUTION_STEPS.suspicious_access
    setAiLoading(false)
    setAiSteps(steps)
  }

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/api/threats/${id}/resolve`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] })
      toast.success('Threat resolved', 'Marked as handled.')
      setSelectedThreat(null)
    },
    onError: () => toast.error('Failed to resolve threat'),
  })

  const filtered = threats.filter((t) => {
    if (activeTab === 'all') return !t.is_resolved
    if (activeTab === 'resolved') return t.is_resolved
    return t.severity === activeTab && !t.is_resolved
  })

  const tabCounts = {
    all: threats.filter((t) => !t.is_resolved).length,
    critical: threats.filter((t) => t.severity === 'critical' && !t.is_resolved).length,
    high: threats.filter((t) => t.severity === 'high' && !t.is_resolved).length,
    medium: threats.filter((t) => t.severity === 'medium' && !t.is_resolved).length,
    low: threats.filter((t) => t.severity === 'low' && !t.is_resolved).length,
    resolved: threats.filter((t) => t.is_resolved).length,
  }

  const tabColor: Record<Tab, string> = {
    all: '#C9A84C', critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#22C55E', resolved: '#2DD4BF',
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
            style={{
              background: activeTab === tab ? `${tabColor[tab]}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeTab === tab ? `${tabColor[tab]}40` : 'rgba(45,212,191,0.1)'}`,
              color: activeTab === tab ? tabColor[tab] : '#86EFAC',
            }}
          >
            <span className="capitalize">{tab}</span>
            <span
              className="text-xs rounded-full px-2 py-0.5"
              style={{ background: activeTab === tab ? `${tabColor[tab]}25` : 'rgba(255,255,255,0.05)', color: activeTab === tab ? tabColor[tab] : '#86EFAC' }}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Threats list */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Shield className="w-16 h-16 text-safe mx-auto mb-4" />
          <p className="text-xl font-semibold text-safe" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            No active threats. You're protected.
          </p>
          <p className="text-text-secondary mt-2 text-sm">AEFORYN is monitoring your platforms 24/7.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((threat, i) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedThreat(threat)}
              className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-150 hover:border-gold/25"
              style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.08)' }}
            >
              <StatusDot
                status={threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'threat' : threat.severity === 'medium' ? 'warning' : 'safe'}
                pulse={!threat.is_resolved && (threat.severity === 'critical' || threat.severity === 'high')}
                size="md"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium text-text-primary truncate">{threat.title}</p>
                  <SeverityBadge severity={threat.severity} />
                  {threat.is_resolved && <span className="badge-safe">Resolved</span>}
                </div>
                <p className="text-xs text-text-secondary truncate">{threat.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  {threat.platform && <span className="text-xs text-gold capitalize">{PLATFORM_LABELS[threat.platform] || threat.platform}</span>}
                  {threat.location && (
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" /> {threat.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="w-3 h-3" /> {timeAgo(threat.detected_at)}
                  </span>
                </div>
              </div>
              {!threat.is_resolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); resolveMutation.mutate(threat.id) }}
                  loading={resolveMutation.isPending}
                  className="flex-shrink-0 text-xs py-1.5 px-3"
                >
                  Resolve
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide-over panel */}
      <AnimatePresence>
        {selectedThreat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedThreat(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
              style={{ background: '#0A2422', borderLeft: '1px solid rgba(201,168,76,0.2)' }}
            >
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
                <h2 className="heading-card">Threat Details</h2>
                <button onClick={() => setSelectedThreat(null)} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusDot
                      status={selectedThreat.severity === 'critical' ? 'critical' : selectedThreat.severity === 'high' ? 'threat' : selectedThreat.severity === 'medium' ? 'warning' : 'safe'}
                      pulse size="lg"
                    />
                    <SeverityBadge severity={selectedThreat.severity} />
                  </div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '20px', color: '#F0FDF4' }}>
                    {selectedThreat.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{selectedThreat.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Platform', value: selectedThreat.platform ? PLATFORM_LABELS[selectedThreat.platform] || selectedThreat.platform : 'Unknown' },
                    { label: 'Type', value: selectedThreat.threat_type.replace(/_/g, ' ') },
                    { label: 'Location', value: selectedThreat.location || 'Unknown' },
                    { label: 'Detected', value: timeAgo(selectedThreat.detected_at) },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
                      <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{label}</p>
                      <p className="text-sm font-medium text-text-primary capitalize">{value}</p>
                    </div>
                  ))}
                </div>

                {!selectedThreat.is_resolved && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-warning-color" />
                      <span className="text-sm font-medium text-warning-color">Recommended action</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {selectedThreat.severity === 'critical' || selectedThreat.severity === 'high'
                        ? 'This is a high-priority threat. Review your account activity immediately and change your password if you don\'t recognise this login.'
                        : 'Review the details above and mark as resolved once you\'ve verified this activity is safe.'}
                    </p>
                  </div>
                )}

                {/* AI Resolution Panel */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
                  <button
                    onClick={() => selectedThreat && openAIResolution(selectedThreat)}
                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-white/3"
                    style={{ background: 'rgba(201,168,76,0.05)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-gold" />
                      <span style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600 }}>AI Resolution Guide</span>
                      {!isProUser && <Lock className="w-3 h-3 text-gold" />}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gold transition-transform ${aiPanelOpen ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {aiPanelOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                          {!isProUser ? (
                            <div className="text-center py-4">
                              <Lock className="w-8 h-8 text-gold mx-auto mb-2" />
                              <p className="text-sm font-medium" style={{ color: '#F0FDF4' }}>Pro feature</p>
                              <p className="text-xs text-text-secondary mt-1 mb-3">AI-powered resolution steps are available on Pro and above.</p>
                              <Link to="/billing" className="btn-primary text-xs px-4 py-2">Upgrade to Pro</Link>
                            </div>
                          ) : aiLoading ? (
                            <div className="flex items-center gap-2 py-4 justify-center">
                              <Loader2 className="w-4 h-4 text-gold animate-spin" />
                              <span className="text-sm text-text-secondary">Generating resolution steps…</span>
                            </div>
                          ) : (
                            <ol className="space-y-2">
                              {aiSteps.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}>{i + 1}</span>
                                  <span style={{ color: '#86EFAC', lineHeight: 1.5 }}>{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {!selectedThreat.is_resolved && (
                <div className="p-6 border-t space-y-3" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => resolveMutation.mutate(selectedThreat.id)}
                    loading={resolveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as resolved
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setSelectedThreat(null)}>
                    Dismiss
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
