import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserX,
  Plus,
  X,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  ChevronRight,
  ChevronDown,
  Search,
  BarChart3,
  Bot,
  Lock,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Handle {
  id: string
  platform: string
  handle: string
  created_at: string
}

interface Alert {
  id: string
  platform: string
  fake_handle: string
  fake_profile_url: string | null
  match_type: 'handle_match' | 'image_match' | 'bio_match' | 'brand_match'
  risk_level: 'low' | 'medium' | 'high' | 'confirmed'
  status: 'active' | 'monitoring' | 'reported' | 'removed' | 'dismissed'
  detected_at: string
  follower_count: number
  ai_analysis: string
  timeline: Array<{ event: string; event_at: string }>
}

interface TakedownGuide {
  steps: Array<{ instruction: string; officialUrl?: string }>
  reportTemplate: string
}

interface AlertDetail extends Alert {
  takedownGuide: TakedownGuide
}

interface PhishingResult {
  verdict: 'Scam' | 'Likely Scam' | 'Legitimate' | 'Uncertain'
  explanation: string
  recommendedAction: string
}

interface MonthlyReport {
  totalNew: number
  totalResolved: number
  totalActive: number
  topPlatforms: string[]
  reportText: string
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_HANDLES: Handle[] = [
  { id: '1', platform: 'instagram', handle: '@aeforyn', created_at: new Date().toISOString() },
  { id: '2', platform: 'tiktok', handle: '@aeforyn', created_at: new Date().toISOString() },
  { id: '3', platform: 'youtube', handle: '@aeforyn', created_at: new Date().toISOString() },
]

const DEMO_ALERTS: Alert[] = [
  {
    id: '1',
    platform: 'tiktok',
    fake_handle: '@aeforyn.official',
    fake_profile_url: null,
    match_type: 'handle_match',
    risk_level: 'high',
    status: 'active',
    detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    follower_count: 1200,
    ai_analysis:
      'This account closely mirrors @aeforyn with minimal variation in the username. The high follower count indicates active deception.',
    timeline: [
      {
        event: 'Fake account detected via handle similarity scan',
        event_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        event: 'Status updated to: monitoring',
        event_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: '2',
    platform: 'instagram',
    fake_handle: '@aeforyn_real',
    fake_profile_url: null,
    match_type: 'bio_match',
    risk_level: 'medium',
    status: 'active',
    detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    follower_count: 340,
    ai_analysis:
      "This account's bio closely matches the creator's original bio. Combined with a similar username it presents a credible impersonation risk.",
    timeline: [
      {
        event: 'Fake account detected via bio similarity scan',
        event_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]

// ─── Platform helpers ─────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'E1306C',
  tiktok: '69C9D0',
  youtube: 'FF0000',
  x: 'FFFFFF',
  facebook: '1877F2',
  linkedin: '0A66C2',
  snapchat: 'FFFC00',
  discord: '5865F2',
  twitch: '9146FF',
  reddit: 'FF4500',
  patreon: 'FF424D',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  snapchat: 'Snapchat',
  discord: 'Discord',
  twitch: 'Twitch',
  reddit: 'Reddit',
  patreon: 'Patreon',
}

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_LABELS)

function PlatformIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const color = PLATFORM_COLORS[platform] || 'AAAAAA'
  const slug = platform === 'x' ? 'x' : platform
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color}`}
      alt={PLATFORM_LABELS[platform] || platform}
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0 }}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MatchTypeBadge({ type }: { type: Alert['match_type'] }) {
  const map: Record<Alert['match_type'], string> = {
    handle_match: 'Handle Match',
    image_match: 'Image Match',
    bio_match: 'Bio Match',
    brand_match: 'Brand Match',
  }
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontFamily: 'Inter, sans-serif',
        padding: '2px 8px',
        borderRadius: '9999px',
        border: '1px solid rgba(201,168,76,0.35)',
        color: '#C9A84C',
        background: 'rgba(201,168,76,0.08)',
        whiteSpace: 'nowrap',
      }}
    >
      {map[type] || type}
    </span>
  )
}

function RiskBadge({ level }: { level: Alert['risk_level'] }) {
  const styles: Record<Alert['risk_level'], React.CSSProperties> = {
    low: { background: 'rgba(100,100,100,0.2)', color: '#9CA3AF', border: '1px solid rgba(156,163,175,0.3)' },
    medium: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)' },
    high: { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' },
    confirmed: {
      background: 'rgba(239,68,68,0.2)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.5)',
      animation: 'pulse 2s infinite',
    },
  }
  const labels: Record<Alert['risk_level'], string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    confirmed: 'Confirmed',
  }
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontFamily: 'Inter, sans-serif',
        padding: '2px 8px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        ...styles[level],
      }}
    >
      {labels[level]}
    </span>
  )
}

function StatusBadge({ status }: { status: Alert['status'] }) {
  const styles: Record<Alert['status'], React.CSSProperties> = {
    active: { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' },
    monitoring: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)' },
    reported: { background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.4)' },
    removed: { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(22,163,74,0.4)' },
    dismissed: { background: 'rgba(100,100,100,0.15)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.3)' },
  }
  const labels: Record<Alert['status'], string> = {
    active: 'Active',
    monitoring: 'Monitoring',
    reported: 'Reported',
    removed: 'Removed',
    dismissed: 'Dismissed',
  }
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontFamily: 'Inter, sans-serif',
        padding: '2px 8px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        ...styles[status],
      }}
    >
      {labels[status]}
    </span>
  )
}

function VerdictBadge({ verdict }: { verdict: PhishingResult['verdict'] }) {
  const styles: Record<PhishingResult['verdict'], React.CSSProperties> = {
    Scam: { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' },
    'Likely Scam': {
      background: 'rgba(245,158,11,0.15)',
      color: '#F59E0B',
      border: '1px solid rgba(245,158,11,0.4)',
    },
    Legitimate: { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)' },
    Uncertain: { background: 'rgba(100,100,100,0.15)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.3)' },
  }
  return (
    <span
      style={{
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '9999px',
        ...styles[verdict],
      }}
    >
      {verdict}
    </span>
  )
}

// ─── Locked Card ──────────────────────────────────────────────────────────────

function LockedCard({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div
      className="card-static"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2.5rem',
        minHeight: '180px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#86EFAC',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        <Icon size={18} style={{ color: '#C9A84C' }} />
        {title}
        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '9999px',
            background: 'rgba(201,168,76,0.15)',
            color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.35)',
            letterSpacing: '0.05em',
          }}
        >
          PRO
        </span>
      </div>
      <p style={{ color: '#86EFAC', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', margin: 0 }}>
        This feature is available on the Pro plan.
      </p>
      <Link
        to="/billing"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
          color: '#071E1C',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        Upgrade to Pro
      </Link>
    </div>
  )
}

// ─── Section A — My Handles ───────────────────────────────────────────────────

function MyHandles({ isPro }: { isPro: boolean }) {
  const [showModal, setShowModal] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newHandle, setNewHandle] = useState('')
  const queryClient = useQueryClient()

  const { data: handles = [] } = useQuery<Handle[]>({
    queryKey: ['impersonation-handles'],
    queryFn: () => api.get('/api/impersonation/handles').then((r) => r.data),
    placeholderData: DEMO_HANDLES,
  })

  const addMutation = useMutation({
    mutationFn: (payload: { platform: string; handle: string }) =>
      api.post('/api/impersonation/handles', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-handles'] })
      toast.success('Handle added', 'Your handle is now being monitored.')
      setShowModal(false)
      setNewHandle('')
    },
    onError: () => {
      toast.error('Failed to add handle', 'Please try again.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/impersonation/handles/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-handles'] })
      toast.success('Handle removed')
    },
    onError: () => {
      toast.error('Failed to remove handle')
    },
  })

  const scanMutation = useMutation({
    mutationFn: () => api.post('/api/impersonation/scan').then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-alerts'] })
      toast.success('Scan started', 'We are scanning for impersonators. Results will appear shortly.')
    },
    onError: () => {
      toast.error('Scan failed', 'Unable to start scan. Please try again.')
    },
  })

  const handleAdd = () => {
    if (!newHandle.trim()) return
    addMutation.mutate({ platform: newPlatform, handle: newHandle.trim() })
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#F0FDF4',
            margin: 0,
          }}
        >
          My Protected Handles
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              background: 'rgba(45,212,191,0.1)',
              border: '1px solid rgba(45,212,191,0.3)',
              color: '#2DD4BF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: scanMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: scanMutation.isPending ? 0.6 : 1,
            }}
          >
            {scanMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Run Scan
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
              border: 'none',
              color: '#071E1C',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Add Handle
          </button>
        </div>
      </div>

      <div className="card-static" style={{ padding: '0', overflow: 'hidden' }}>
        {handles.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#86EFAC',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            }}
          >
            No handles registered yet. Add your first handle to start monitoring.
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {handles.map((h, i) => (
              <li
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < handles.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none',
                }}
              >
                <PlatformIcon platform={h.platform} size={18} />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.875rem',
                    color: '#F0FDF4',
                    flex: 1,
                  }}
                >
                  {h.handle}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: '#86EFAC',
                    marginRight: '0.5rem',
                  }}
                >
                  {PLATFORM_LABELS[h.platform] || h.platform}
                </span>
                <button
                  onClick={() => deleteMutation.mutate(h.id)}
                  disabled={deleteMutation.isPending}
                  title="Remove handle"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#EF4444',
                    opacity: 0.7,
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Handle Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                background: '#0A2422',
                border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 0 32px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#F0FDF4',
                    margin: 0,
                  }}
                >
                  Add Handle to Monitor
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#86EFAC',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: '#86EFAC',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background: '#071E1C',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: '#F0FDF4',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  >
                    {SUPPORTED_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: '#86EFAC',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Handle
                  </label>
                  <input
                    type="text"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="@yourhandle"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background: '#071E1C',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: '#F0FDF4',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleAdd}
                  disabled={addMutation.isPending || !newHandle.trim()}
                  style={{
                    marginTop: '0.25rem',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
                    border: 'none',
                    color: '#071E1C',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: addMutation.isPending || !newHandle.trim() ? 'not-allowed' : 'pointer',
                    opacity: addMutation.isPending || !newHandle.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {addMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Add Handle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section B — Active Alerts ────────────────────────────────────────────────

function ActiveAlerts({ isPro, onViewTakedown }: { isPro: boolean; onViewTakedown: (alert: Alert) => void }) {
  const queryClient = useQueryClient()

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['impersonation-alerts'],
    queryFn: () => api.get('/api/impersonation/alerts').then((r) => r.data),
    placeholderData: DEMO_ALERTS,
  })

  const markReportedMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/impersonation/alerts/${id}/status`, { status: 'reported' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-alerts'] })
      toast.success('Marked as reported')
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  if (alerts.length === 0) {
    return (
      <div
        className="card-static"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#86EFAC',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
        }}
      >
        <CheckCircle size={28} style={{ color: '#22C55E', marginBottom: '0.5rem' }} />
        <p style={{ margin: 0 }}>No active alerts. Your identity looks clean.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          className="card"
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PlatformIcon platform={alert.platform} size={20} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#F0FDF4',
                }}
              >
                {alert.fake_handle}
              </span>
            </div>
            {alert.fake_profile_url && (
              <a href={alert.fake_profile_url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} style={{ color: '#86EFAC' }} />
              </a>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <MatchTypeBadge type={alert.match_type} />
            <RiskBadge level={alert.risk_level} />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              color: '#86EFAC',
            }}
          >
            <span>
              <strong style={{ color: '#F0FDF4' }}>{alert.follower_count.toLocaleString()}</strong> followers
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              {formatRelativeDate(alert.detected_at)}
            </span>
          </div>

          {isPro && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
              <button
                onClick={() => onViewTakedown(alert)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '7px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#C9A84C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                }}
              >
                <Shield size={12} />
                Takedown Guide
              </button>
              <button
                onClick={() => markReportedMutation.mutate(alert.id)}
                disabled={markReportedMutation.isPending || alert.status === 'reported'}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '7px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#EF4444',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor:
                    markReportedMutation.isPending || alert.status === 'reported' ? 'not-allowed' : 'pointer',
                  opacity: alert.status === 'reported' ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                }}
              >
                <AlertTriangle size={12} />
                Mark Reported
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Section C — Fake Account Tracker ────────────────────────────────────────

function FakeAccountTracker({ onViewTakedown }: { onViewTakedown: (alert: Alert) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['impersonation-alerts'],
    queryFn: () => api.get('/api/impersonation/alerts').then((r) => r.data),
    placeholderData: DEMO_ALERTS,
  })

  const markReportedMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/impersonation/alerts/${id}/status`, { status: 'reported' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-alerts'] })
      toast.success('Marked as reported')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const toggleRow = (id: string) => setExpandedId(expandedId === id ? null : id)

  return (
    <div className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              {['Platform', 'Fake Handle', 'Risk', 'Status', 'Detected', 'Actions'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#C9A84C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, i) => (
              <>
                <tr
                  key={alert.id}
                  onClick={() => toggleRow(alert.id)}
                  style={{
                    borderBottom:
                      expandedId === alert.id
                        ? 'none'
                        : i < alerts.length - 1
                        ? '1px solid rgba(201,168,76,0.08)'
                        : 'none',
                    cursor: 'pointer',
                    background: expandedId === alert.id ? 'rgba(201,168,76,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <PlatformIcon platform={alert.platform} size={18} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.85rem',
                        color: '#F0FDF4',
                      }}
                    >
                      {alert.fake_handle}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <RiskBadge level={alert.risk_level} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <StatusBadge status={alert.status} />
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: '#86EFAC',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatRelativeDate(alert.detected_at)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewTakedown(alert)
                        }}
                        title="Takedown Guide"
                        style={{
                          background: 'rgba(201,168,76,0.1)',
                          border: '1px solid rgba(201,168,76,0.3)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#C9A84C',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Shield size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markReportedMutation.mutate(alert.id)
                        }}
                        title="Mark as Reported"
                        disabled={alert.status === 'reported'}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#EF4444',
                          cursor: alert.status === 'reported' ? 'not-allowed' : 'pointer',
                          opacity: alert.status === 'reported' ? 0.4 : 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <AlertTriangle size={13} />
                      </button>
                      <span style={{ color: '#86EFAC', marginLeft: '0.25rem' }}>
                        {expandedId === alert.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedId === alert.id && (
                    <tr key={`${alert.id}-expanded`}>
                      <td
                        colSpan={6}
                        style={{
                          padding: 0,
                          borderBottom: i < alerts.length - 1 ? '1px solid rgba(201,168,76,0.08)' : 'none',
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: '1rem 1.25rem 1.25rem 1.25rem',
                              background: 'rgba(7,30,28,0.5)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                            }}
                          >
                            {alert.ai_analysis && (
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '0.5rem',
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  background: 'rgba(45,212,191,0.06)',
                                  border: '1px solid rgba(45,212,191,0.15)',
                                }}
                              >
                                <Bot size={16} style={{ color: '#2DD4BF', flexShrink: 0, marginTop: '1px' }} />
                                <p
                                  style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.8rem',
                                    color: '#86EFAC',
                                    margin: 0,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {alert.ai_analysis}
                                </p>
                              </div>
                            )}
                            <div>
                              <p
                                style={{
                                  fontFamily: 'Space Grotesk, sans-serif',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  color: '#C9A84C',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  margin: '0 0 0.5rem 0',
                                }}
                              >
                                Timeline
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {alert.timeline.map((t, ti) => (
                                  <div
                                    key={ti}
                                    style={{
                                      display: 'flex',
                                      gap: '0.75rem',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#2DD4BF',
                                        marginTop: '5px',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <span
                                        style={{
                                          fontFamily: 'Inter, sans-serif',
                                          fontSize: '0.8rem',
                                          color: '#F0FDF4',
                                        }}
                                      >
                                        {t.event}
                                      </span>
                                      <span
                                        style={{
                                          display: 'block',
                                          fontFamily: 'JetBrains Mono, monospace',
                                          fontSize: '0.7rem',
                                          color: '#86EFAC',
                                          marginTop: '1px',
                                        }}
                                      >
                                        {formatDateTime(t.event_at)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section D — Phishing Scanner ────────────────────────────────────────────

function PhishingScanner() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PhishingResult | null>(null)

  const analyseMutation = useMutation({
    mutationFn: (payload: { text: string }) =>
      api.post('/api/impersonation/phishing-check', payload).then((r) => r.data as PhishingResult),
    onSuccess: (data) => {
      setResult(data)
    },
    onError: () => {
      toast.error('Analysis failed', 'Unable to analyse the text. Please try again.')
    },
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a suspicious email or DM here..."
        rows={6}
        style={{
          width: '100%',
          padding: '0.875rem',
          borderRadius: '10px',
          background: '#071E1C',
          border: '1px solid rgba(201,168,76,0.2)',
          color: '#F0FDF4',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.825rem',
          lineHeight: 1.6,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={() => analyseMutation.mutate({ text })}
        disabled={analyseMutation.isPending || !text.trim()}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
          border: 'none',
          color: '#071E1C',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: analyseMutation.isPending || !text.trim() ? 'not-allowed' : 'pointer',
          opacity: analyseMutation.isPending || !text.trim() ? 0.6 : 1,
        }}
      >
        {analyseMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
        Analyse
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="card-static"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: '#86EFAC',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {result.explanation}
            </p>
            {result.recommendedAction && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(45,212,191,0.06)',
                  border: '1px solid rgba(45,212,191,0.15)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#2DD4BF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.25rem 0',
                  }}
                >
                  Recommended Action
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: '#F0FDF4',
                    margin: 0,
                  }}
                >
                  {result.recommendedAction}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section E — Monthly Report ───────────────────────────────────────────────

function MonthlyReportSection() {
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/impersonation/monthly-report')
      setReport(res.data)
    } catch {
      toast.error('Failed to generate report', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        onClick={fetchReport}
        disabled={loading}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
          border: 'none',
          color: '#071E1C',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <BarChart3 size={15} />}
        Generate Monthly Report
      </button>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card-static"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {[
                { label: 'New This Month', value: report.totalNew, color: '#EF4444' },
                { label: 'Resolved', value: report.totalResolved, color: '#22C55E' },
                { label: 'Still Active', value: report.totalActive, color: '#F59E0B' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '10px',
                    background: 'rgba(7,30,28,0.5)',
                    border: '1px solid rgba(201,168,76,0.12)',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: stat.color,
                      margin: '0 0 0.2rem 0',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.75rem',
                      color: '#86EFAC',
                      margin: 0,
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {report.topPlatforms && report.topPlatforms.length > 0 && (
              <div>
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#C9A84C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Top Platforms
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {report.topPlatforms.map((p) => (
                    <div
                      key={p}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <PlatformIcon platform={p} size={16} />
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.8rem',
                          color: '#F0FDF4',
                        }}
                      >
                        {PLATFORM_LABELS[p] || p}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.reportText && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#071E1C',
                  border: '1px solid rgba(201,168,76,0.12)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.8rem',
                  color: '#86EFAC',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {report.reportText}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Takedown Guide Side Panel ────────────────────────────────────────────────

function TakedownPanel({
  alert,
  onClose,
}: {
  alert: Alert
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const { data: alertDetail, isLoading } = useQuery<AlertDetail>({
    queryKey: ['impersonation-alert-detail', alert.id],
    queryFn: () => api.get(`/api/impersonation/alerts/${alert.id}`).then((r) => r.data),
  })

  const markReportedMutation = useMutation({
    mutationFn: () =>
      api.patch(`/api/impersonation/alerts/${alert.id}/status`, { status: 'reported' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation-alerts'] })
      toast.success('Marked as reported')
      onClose()
    },
    onError: () => toast.error('Failed to update status'),
  })

  const copyTemplate = () => {
    if (alertDetail?.takedownGuide?.reportTemplate) {
      navigator.clipboard.writeText(alertDetail.takedownGuide.reportTemplate).then(() => {
        toast.success('Copied to clipboard', 'Report template has been copied.')
      })
    }
  }

  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
        }}
      />
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: '#0A2422',
          borderLeft: '1px solid rgba(201,168,76,0.2)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={18} style={{ color: '#C9A84C' }} />
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#F0FDF4',
                margin: 0,
              }}
            >
              How to Remove This Fake Account
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#86EFAC',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Fake account summary */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(201,168,76,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0,
            background: 'rgba(7,30,28,0.4)',
          }}
        >
          <PlatformIcon platform={alert.platform} size={22} />
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#F0FDF4',
                display: 'block',
              }}
            >
              {alert.fake_handle}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.78rem',
                color: '#86EFAC',
              }}
            >
              {PLATFORM_LABELS[alert.platform] || alert.platform}
            </span>
          </div>
          <RiskBadge level={alert.risk_level} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    height: '60px',
                    borderRadius: '8px',
                    background: 'rgba(201,168,76,0.06)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
          ) : alertDetail?.takedownGuide?.steps ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
              >
                Removal Steps
              </p>
              {alertDetail.takedownGuide.steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.875rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(201,168,76,0.15)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#C9A84C',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.875rem',
                        color: '#F0FDF4',
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {step.instruction}
                    </p>
                    {step.officialUrl && (
                      <a
                        href={step.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginTop: '0.35rem',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#C9A84C',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={12} />
                        Go to {PLATFORM_LABELS[alert.platform] || alert.platform} Report Page →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: '#86EFAC',
                textAlign: 'center',
                marginTop: '2rem',
              }}
            >
              No takedown guide available for this alert yet.
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(201,168,76,0.15)',
            display: 'flex',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <button
            onClick={copyTemplate}
            disabled={!alertDetail?.takedownGuide?.reportTemplate}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#C9A84C',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: !alertDetail?.takedownGuide?.reportTemplate ? 'not-allowed' : 'pointer',
              opacity: !alertDetail?.takedownGuide?.reportTemplate ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <Copy size={14} />
            Copy Report Template
          </button>
          <button
            onClick={() => markReportedMutation.mutate()}
            disabled={markReportedMutation.isPending || alert.status === 'reported'}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
              border: 'none',
              color: '#071E1C',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor:
                markReportedMutation.isPending || alert.status === 'reported' ? 'not-allowed' : 'pointer',
              opacity: alert.status === 'reported' ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            {markReportedMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Mark as Reported
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <h2
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#F0FDF4',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Icon size={17} style={{ color: '#C9A84C' }} />
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Impersonation() {
  const { user } = useAuthStore()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const planTier: string = (user as any)?.plan_tier ?? 'free'
  const isFree = planTier === 'free'
  const isStandard = planTier === 'standard'
  const isPro = planTier === 'pro'
  const isStandardOrPro = isStandard || isPro

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#071E1C',
        padding: '2rem 1.5rem',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {/* Page Heading */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <UserX size={22} style={{ color: '#C9A84C' }} />
          <h1 className="heading-gold" style={{ margin: 0, fontSize: '1.6rem' }}>
            IMPERSONATION DETECTION
          </h1>
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: '#86EFAC',
            margin: 0,
          }}
        >
          Monitor, detect, and take down accounts impersonating your brand.
        </p>
      </div>

      {/* FREE TIER — Upgrade prompt */}
      {isFree && (
        <div
          className="card-static"
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <Lock size={36} style={{ color: '#C9A84C', marginBottom: '1rem' }} />
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#F0FDF4',
                margin: '0 0 0.75rem 0',
              }}
            >
              Protect Your Identity Online
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                color: '#86EFAC',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Impersonation Detection scans platforms for accounts pretending to be you — and helps you take
              them down fast. Upgrade to Pro to access the full suite.
            </p>
          </div>

          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              textAlign: 'left',
            }}
          >
            {[
              { icon: Search, text: 'Handle matching — detect slight username variations' },
              { icon: Shield, text: 'Image matching — catch profile photo theft' },
              { icon: Bot, text: 'Bio matching — identify copied bios and descriptions' },
              { icon: AlertTriangle, text: 'Brand deal phishing scanner — spot fake collab outreach' },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ color: '#C9A84C' }} />
                </div>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: '#F0FDF4',
                  }}
                >
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/billing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 2rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
              color: '#071E1C',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* STANDARD + PRO */}
      {isStandardOrPro && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Section A — My Handles */}
          <SectionCard title="My Protected Handles" icon={Shield}>
            <MyHandles isPro={isPro} />
          </SectionCard>

          {/* Section B — Active Alerts */}
          <SectionCard title="Active Alerts" icon={AlertTriangle}>
            <ActiveAlerts isPro={isPro} onViewTakedown={(alert) => setSelectedAlert(alert)} />
          </SectionCard>

          {/* Section C — Fake Account Tracker (Pro) */}
          <SectionCard title="Fake Account Tracker" icon={UserX}>
            {isPro ? (
              <FakeAccountTracker onViewTakedown={(alert) => setSelectedAlert(alert)} />
            ) : (
              <LockedCard title="Fake Account Tracker" icon={UserX} />
            )}
          </SectionCard>

          {/* Section D — Brand Deal Phishing Scanner (Pro) */}
          <SectionCard title="Brand Deal Phishing Scanner" icon={Bot}>
            {isPro ? (
              <div className="card-static" style={{ padding: '1.25rem' }}>
                <PhishingScanner />
              </div>
            ) : (
              <LockedCard title="Brand Deal Phishing Scanner" icon={Bot} />
            )}
          </SectionCard>

          {/* Section E — Monthly Report (Pro) */}
          <SectionCard title="Monthly Report" icon={BarChart3}>
            {isPro ? (
              <div className="card-static" style={{ padding: '1.25rem' }}>
                <MonthlyReportSection />
              </div>
            ) : (
              <LockedCard title="Monthly Report" icon={BarChart3} />
            )}
          </SectionCard>
        </div>
      )}

      {/* Takedown Guide Panel */}
      <AnimatePresence>
        {selectedAlert && isPro && (
          <TakedownPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
