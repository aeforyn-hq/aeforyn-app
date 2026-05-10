import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { LifeBuoy, CheckCircle, ChevronRight, Bot, Lock, ArrowLeft, Clock, Copy, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { PLATFORM_LABELS } from '@/lib/utils'
import type { RecoverySession } from '@/types'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'email', label: 'Email' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'linkedin', label: 'LinkedIn' },
]

const INCIDENT_TYPES = [
  { id: 'account_hacked', label: 'Account hacked', description: 'Someone else has access to my account' },
  { id: 'cant_login', label: "Can't log in", description: "I'm locked out of my account" },
  { id: 'posts_deleted', label: 'Posts deleted', description: 'Content has been removed from my account' },
  { id: 'account_suspended', label: 'Account suspended', description: 'My account has been disabled or banned' },
  { id: 'impersonation', label: 'Impersonation', description: 'Someone is pretending to be me' },
]

interface PlaybookStep {
  id: number
  title: string
  description: string
  instructions: string[]
  estimated_minutes: number
}

interface Playbook {
  platform: string
  incident_type: string
  title: string
  description: string
  steps: PlaybookStep[]
}

// Embedded fallback playbook data for demo (abridged — real data comes from API)
const DEMO_PLAYBOOK: Playbook = {
  platform: 'instagram',
  incident_type: 'account_hacked',
  title: 'Instagram Account Compromised',
  description: 'Your Instagram account has been accessed by someone else. Follow these steps in order.',
  steps: [
    {
      id: 1,
      title: 'Secure your email account first',
      description: 'Your Instagram password reset goes to your email. Secure it before anything else.',
      instructions: [
        'Go to your email provider on a trusted device',
        'Change your email password immediately',
        'Enable 2FA on your email if not already active',
        'Check for any unrecognised recovery options and remove them',
        'Sign out all other sessions on your email account',
      ],
      estimated_minutes: 10,
    },
    {
      id: 2,
      title: "Use Instagram's official account recovery",
      description: "Go to instagram.com/hacked. Do not use any third-party recovery services.",
      instructions: [
        'Go to instagram.com/hacked on a trusted device',
        "Tap \"My account was hacked\"",
        'Follow the identity verification prompts',
        'Instagram may ask you to verify via phone number or email',
        'Do NOT pay anyone claiming they can recover your account',
      ],
      estimated_minutes: 15,
    },
    {
      id: 3,
      title: 'Revoke all active sessions',
      description: 'Once you have access back, log out every unknown device.',
      instructions: [
        'Go to your Instagram profile → Settings',
        'Tap Security → Login Activity',
        'Review every device and location listed',
        'Log out of every device and location you don\'t recognise',
      ],
      estimated_minutes: 5,
    },
    {
      id: 4,
      title: 'Change your password immediately',
      description: 'Your old password is compromised. Replace it now.',
      instructions: [
        'Go to Settings → Security → Password',
        'Create a new password of at least 20 characters',
        'Use a mix of uppercase, lowercase, numbers, and symbols',
        'Never reuse a password from any other site',
        'Save it in a password manager',
      ],
      estimated_minutes: 5,
    },
    {
      id: 5,
      title: 'Enable two-factor authentication',
      description: 'Use an authenticator app — not SMS.',
      instructions: [
        'Go to Settings → Security → Two-Factor Authentication',
        'Select "Authentication App" (not SMS)',
        'Install Google Authenticator or Authy if needed',
        'Scan the QR code shown on Instagram',
        'Save your backup codes to your AEFORYN vault',
      ],
      estimated_minutes: 10,
    },
    {
      id: 6,
      title: 'Audit connected apps and revoke suspicious ones',
      description: 'Hackers often grant themselves access through third-party apps.',
      instructions: [
        'Go to Settings → Security → Apps and Websites',
        'Review the Active tab carefully',
        'Remove any app you didn\'t personally authorise',
        'Remove any app you don\'t recognise',
        'Check the Expired tab and clean those out too',
      ],
      estimated_minutes: 5,
    },
  ],
}

export default function Recovery() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedIncident, setSelectedIncident] = useState('')
  const [activeSession, setActiveSession] = useState<{ session: RecoverySession; playbook: Playbook } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [completed, setCompleted] = useState(false)
  const [incidentReport, setIncidentReport] = useState<Record<string, unknown> | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const isPro = user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise'

  const { data: sessions = [] } = useQuery({
    queryKey: ['recovery-sessions'],
    queryFn: async () => {
      const { data } = await api.get<RecoverySession[]>('/api/recovery/sessions')
      return data
    },
    placeholderData: [],
  })

  const startMutation = useMutation({
    mutationFn: async ({ platform, incident_type }: { platform: string; incident_type: string }) => {
      const { data } = await api.post('/api/recovery/sessions', { platform, incident_type })
      return data as { session: RecoverySession; playbook: Playbook }
    },
    onSuccess: (data) => {
      setActiveSession(data)
      setCompletedSteps([])
      setCompleted(false)
    },
    onError: () => {
      // Use demo playbook if API unavailable (e.g. plan restriction in demo)
      const demoSession: RecoverySession = {
        id: 'demo',
        user_id: 'demo',
        platform: selectedPlatform,
        incident_type: selectedIncident,
        steps_completed: 0,
        total_steps: DEMO_PLAYBOOK.steps.length,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }
      setActiveSession({ session: demoSession, playbook: DEMO_PLAYBOOK })
      setCompletedSteps([])
      setCompleted(false)
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post(`/api/recovery/sessions/${sessionId}/complete`, {})
      return data as { incident_report: Record<string, unknown> }
    },
    onSuccess: (data) => {
      setCompleted(true)
      setIncidentReport(data.incident_report)
      queryClient.invalidateQueries({ queryKey: ['recovery-sessions'] })
    },
    onError: () => {
      setCompleted(true)
      setIncidentReport({
        platform: selectedPlatform,
        incident_type: selectedIncident,
        completed_at: new Date().toISOString(),
        steps_completed: completedSteps.length,
        total_steps: activeSession?.playbook.steps.length || 0,
        time_taken_minutes: Math.round((Date.now() - new Date(activeSession?.session.started_at || Date.now()).getTime()) / 60000),
      })
    },
  })

  const markStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId]
      setCompletedSteps(newCompleted)
      if (activeSession?.session.id && activeSession.session.id !== 'demo') {
        api.patch(`/api/recovery/sessions/${activeSession.session.id}/step`, { steps_completed: newCompleted.length }).catch(() => {})
      }
    }
  }

  const handleStart = () => {
    if (!selectedPlatform || !selectedIncident) { toast.error('Select a platform and incident type'); return }
    startMutation.mutate({ platform: selectedPlatform, incident_type: selectedIncident })
  }

  const handleComplete = () => {
    if (activeSession) {
      completeMutation.mutate(activeSession.session.id)
    }
  }

  const reset = () => {
    setActiveSession(null)
    setSelectedPlatform('')
    setSelectedIncident('')
    setCompletedSteps([])
    setCompleted(false)
    setIncidentReport(null)
  }

  // Completion screen
  if (completed && incidentReport) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div className="card-static text-center py-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle className="w-10 h-10 text-safe" />
          </motion.div>
          <h2 className="heading-section text-safe mb-2">Recovery Complete</h2>
          <p className="text-text-secondary text-sm">You've worked through all the steps. Your account should now be secure.</p>
        </div>

        {/* Incident report */}
        <div className="card-static space-y-4">
          <h3 className="heading-card">Incident Report</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Platform', value: PLATFORM_LABELS[(incidentReport.platform as string)] || String(incidentReport.platform || '') },
              { label: 'Incident', value: String(incidentReport.incident_type || '').replace(/_/g, ' ') },
              { label: 'Completed', value: new Date(String(incidentReport.completed_at || '')).toLocaleDateString() },
              { label: 'Time taken', value: `${incidentReport.time_taken_minutes || 0} minutes` },
              { label: 'Steps completed', value: `${incidentReport.steps_completed}/${incidentReport.total_steps}` },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
                <p className="text-xs text-text-secondary mb-1 uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{label}</p>
                <p className="text-sm font-medium text-text-primary capitalize">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(incidentReport, null, 2))
              toast.success('Report copied to clipboard')
            }}>
              <Copy className="w-4 h-4" /> Copy Report
            </Button>
            <Button variant="primary" className="flex-1" onClick={reset}>
              Start New Recovery
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Active recovery flow
  if (activeSession) {
    const { playbook } = activeSession
    const currentStepIndex = completedSteps.length
    const currentStep = playbook.steps[currentStepIndex]
    const allDone = completedSteps.length >= playbook.steps.length
    const progressPct = Math.round((completedSteps.length / playbook.steps.length) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-static">
          <div className="flex items-center justify-between mb-3">
            <button onClick={reset} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="mono-text text-xs text-gold">Step {currentStepIndex + 1} of {playbook.steps.length}</span>
          </div>
          <h2 className="heading-card mb-4">{playbook.title}</h2>
          <ProgressBar value={progressPct} color="gold" size="lg" showLabel />
        </motion.div>

        {/* Completed steps mini list */}
        {completedSteps.length > 0 && (
          <div className="space-y-2">
            {playbook.steps.filter((s) => completedSteps.includes(s.id)).map((step) => (
              <div key={step.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
                <span className="text-sm text-safe">{step.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current step */}
        {!allDone && currentStep && (
          <motion.div key={currentStep.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-static">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#C9A84C' }}>{currentStep.id}</span>
              </div>
              <div>
                <h3 className="heading-card">{currentStep.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-text-secondary" />
                  <span className="text-xs text-text-secondary">~{currentStep.estimated_minutes} minutes</span>
                </div>
              </div>
            </div>

            <p className="text-text-secondary text-sm mb-5 leading-relaxed">{currentStep.description}</p>

            <ol className="space-y-3 mb-6">
              {currentStep.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)', fontSize: '11px' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full" onClick={() => markStep(currentStep.id)}>
                <CheckCircle className="w-4 h-4" /> Mark Step Complete
              </Button>
              <Link to="/ai" className="flex items-center justify-center gap-2 text-sm text-teal hover:text-teal-mid transition-colors py-2">
                <Bot className="w-4 h-4" /> I need help with this step
              </Link>
            </div>
          </motion.div>
        )}

        {/* All steps done */}
        {allDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static text-center py-8">
            <CheckCircle className="w-12 h-12 text-safe mx-auto mb-4" />
            <h3 className="heading-card text-safe mb-2">All steps completed!</h3>
            <p className="text-text-secondary text-sm mb-6">Generate your incident report to document what happened.</p>
            <Button variant="primary" className="w-full" onClick={handleComplete} loading={completeMutation.isPending}>
              Generate Incident Report
            </Button>
          </motion.div>
        )}
      </div>
    )
  }

  // Selection screen
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Platform selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4" style={{ letterSpacing: '1.5px' }}>
          Which platform are you having issues with?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPlatform(p.id); setSelectedIncident('') }}
              className="p-5 rounded-2xl text-center font-semibold transition-all duration-150"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '16px',
                background: selectedPlatform === p.id ? 'rgba(201,168,76,0.1)' : '#0A2422',
                border: `1px solid ${selectedPlatform === p.id ? 'rgba(201,168,76,0.5)' : 'rgba(45,212,191,0.1)'}`,
                color: selectedPlatform === p.id ? '#C9A84C' : '#F0FDF4',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Incident type selector */}
      <AnimatePresence>
        {selectedPlatform && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4" style={{ letterSpacing: '1.5px' }}>
              What happened?
            </p>
            <div className="space-y-2">
              {INCIDENT_TYPES.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: selectedIncident === incident.id ? 'rgba(201,168,76,0.08)' : '#0A2422',
                    border: `1px solid ${selectedIncident === incident.id ? 'rgba(201,168,76,0.4)' : 'rgba(45,212,191,0.08)'}`,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{incident.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{incident.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-colors ${selectedIncident === incident.id ? 'text-gold' : 'text-text-secondary'}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start button */}
      <AnimatePresence>
        {selectedPlatform && selectedIncident && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!isPro && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-4"
                style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <Lock className="w-5 h-5 text-gold flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gold">Recovery Playbooks — Pro Feature</p>
                  <p className="text-xs text-text-secondary">Upgrade to Pro for full step-by-step recovery guides.</p>
                </div>
                <Link to="/billing" className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">Upgrade to Pro</Link>
              </div>
            )}
            <Button variant="primary" className="w-full" onClick={handleStart} loading={startMutation.isPending}>
              <LifeBuoy className="w-5 h-5" />
              Start Recovery for {PLATFORM_LABELS[selectedPlatform] || selectedPlatform}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery history */}
      {sessions.length > 0 && (
        <div>
          <button onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl"
            style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <span className="text-sm font-medium text-text-primary">Recovery History ({sessions.length})</span>
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium text-text-primary capitalize">
                      {PLATFORM_LABELS[session.platform] || session.platform} — {session.incident_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {session.steps_completed}/{session.total_steps} steps · {session.status}
                    </p>
                  </div>
                  <span className={`badge ${session.status === 'completed' ? 'badge-safe' : 'badge-gold'}`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
