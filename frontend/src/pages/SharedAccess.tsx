import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, X, Clock, Shield, Eye, EyeOff, Trash2, ChevronRight,
  Activity, AlertTriangle, CheckCircle, ExternalLink, Copy, Lock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_DELEGATIONS = [
  {
    id: '1',
    owner_id: 'demo',
    delegate_name: 'Sarah (VA)',
    delegate_email: 'sarah@example.com',
    platforms: ['Instagram', 'TikTok'],
    vault_item_ids: ['v1', 'v2'],
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    password_changed_after: false,
    access_token: 'demo',
  },
  {
    id: '2',
    owner_id: 'demo',
    delegate_name: 'James (Editor)',
    delegate_email: 'james@example.com',
    platforms: ['YouTube'],
    vault_item_ids: ['v3'],
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
    password_changed_after: false,
    access_token: 'demo2',
  },
]

const DEMO_ACTIVITY = [
  {
    id: '1',
    action: 'link_opened',
    platform: null,
    detail: null,
    performed_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    ip_address: '41.21.45.123',
  },
  {
    id: '2',
    action: 'password_revealed',
    platform: 'YouTube',
    detail: 'v3',
    performed_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    ip_address: '41.21.45.123',
  },
  {
    id: '3',
    action: 'session_expired',
    platform: null,
    detail: null,
    performed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ip_address: null,
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Delegation {
  id: string
  owner_id: string
  delegate_name: string
  delegate_email: string
  platforms: string[]
  vault_item_ids: string[]
  expires_at: string
  created_at: string
  status: 'active' | 'expired' | 'revoked'
  password_changed_after: boolean
  access_token: string
}

interface ActivityEntry {
  id: string
  action: string
  platform: string | null
  detail: string | null
  performed_at: string
  ip_address: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  'Instagram', 'TikTok', 'YouTube', 'X', 'Facebook',
  'LinkedIn', 'Discord', 'Twitch', 'Patreon',
]

const DURATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '3 hours', value: 3 },
  { label: '6 hours', value: 6 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: 'Custom', value: -1 },
]

const ACTION_LABELS: Record<string, string> = {
  link_opened: 'Link opened',
  password_revealed: 'Password revealed',
  session_expired: 'Session expired',
  revoked: 'Access revoked',
  delegation_created: 'Delegation created',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getRemainingMs(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now()
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSecs = Math.floor(ms / 1000)
  const hh = Math.floor(totalSecs / 3600).toString().padStart(2, '0')
  const mm = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0')
  const ss = (totalSecs % 60).toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// ─── CountdownTimer ───────────────────────────────────────────────────────────

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemainingMs(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingMs(expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isUrgent = remaining > 0 && remaining < 30 * 60 * 1000

  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: 600,
        color: isUrgent ? '#EF4444' : '#2DD4BF',
        letterSpacing: '0.05em',
      }}
    >
      {remaining <= 0 ? 'Expired' : `${formatCountdown(remaining)} remaining`}
    </span>
  )
}

// ─── Upgrade Gate (free/standard) ────────────────────────────────────────────

function UpgradeGate() {
  const highlights = [
    {
      icon: Shield,
      title: 'Reveal once only',
      desc: 'Each password can only be shown once in a session',
    },
    {
      icon: Clock,
      title: 'Auto-expiry',
      desc: 'The link dies automatically at your chosen time',
    },
    {
      icon: Activity,
      title: 'Full activity log',
      desc: 'Every action is logged with timestamp and IP address',
    },
    {
      icon: AlertTriangle,
      title: 'Password change reminder',
      desc: 'AEFORYN reminds you to change your password after each session ends',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 720 }}
    >
      {/* Description */}
      <div
        className="card-static"
        style={{
          padding: '28px 32px',
          marginBottom: 28,
          borderLeft: '3px solid #C9A84C',
        }}
      >
        <p style={{ color: '#F0FDF4', lineHeight: 1.7, fontSize: 15 }}>
          Grant your VA, editor, or social media manager time-limited access to a
          platform password — without sending it over WhatsApp, email, or chat.
          The password is revealed once through a secure expiring link. When the
          session ends, the link dies and AEFORYN guides you to change it.
        </p>
      </div>

      {/* Highlight cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 36,
        }}
      >
        {highlights.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            className="card-static"
            whileHover={{ borderColor: 'rgba(201,168,76,0.30)' }}
            style={{ padding: '20px 24px', display: 'flex', gap: 14 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(201,168,76,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <p style={{ color: '#F0FDF4', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {title}
              </p>
              <p style={{ color: '#86EFAC', fontSize: 13, lineHeight: 1.5 }}>{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Link to="/billing">
        <button
          className="btn-primary"
          style={{ padding: '14px 36px', fontSize: 15, fontWeight: 700 }}
        >
          Upgrade to Pro
        </button>
      </Link>
    </motion.div>
  )
}

// ─── Grant Access Panel ───────────────────────────────────────────────────────

interface GrantPanelProps {
  onClose: () => void
}

function GrantPanel({ onClose }: GrantPanelProps) {
  const queryClient = useQueryClient()
  const [delegateName, setDelegateName] = useState('')
  const [delegateEmail, setDelegateEmail] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [durationOption, setDurationOption] = useState<number>(1)
  const [customExpiry, setCustomExpiry] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async (payload: {
      delegate_name: string
      delegate_email: string
      platforms: string[]
      duration_hours?: number
      expires_at?: string
    }) => {
      const { data } = await api.post('/api/access/delegations', payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
      const expiryDate =
        variables.expires_at
          ? new Date(variables.expires_at).toLocaleString('en-GB', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
            })
          : `${variables.duration_hours} hour(s) from now`

      const msg = `Secure link sent to ${variables.delegate_email}. It expires at ${expiryDate}. Remember to change your passwords after their session ends.`
      setSuccessMsg(msg)
      toast.success('Secure link sent!', msg)
    },
    onError: () => {
      toast.error('Failed to create delegation', 'Please try again.')
    },
  })

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!delegateName.trim() || !delegateEmail.trim() || selectedPlatforms.length === 0) {
      toast.error('Missing fields', 'Please fill all required fields and select at least one platform.')
      return
    }
    if (durationOption === -1 && !customExpiry) {
      toast.error('Missing expiry', 'Please set a custom expiry date/time.')
      return
    }

    const payload: Parameters<typeof createMutation.mutate>[0] = {
      delegate_name: delegateName,
      delegate_email: delegateEmail,
      platforms: selectedPlatforms,
    }

    if (durationOption === -1) {
      payload.expires_at = new Date(customExpiry).toISOString()
    } else {
      payload.duration_hours = durationOption
    }

    createMutation.mutate(payload)
  }

  return (
    <motion.div
      key="grant-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 480,
        maxWidth: '100vw',
        background: '#0A2422',
        borderLeft: '1px solid rgba(201,168,76,0.20)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          position: 'sticky',
          top: 0,
          background: '#0A2422',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lock size={18} style={{ color: '#C9A84C' }} />
          <span
            style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: 18,
              color: '#F0FDF4',
            }}
          >
            Grant Temporary Access
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: '6px 8px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '28px', flex: 1 }}>
        {successMsg ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.30)',
              borderRadius: 12,
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={40} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
            <p style={{ color: '#F0FDF4', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
              Access Granted
            </p>
            <p style={{ color: '#86EFAC', fontSize: 14, lineHeight: 1.6 }}>{successMsg}</p>
            <button
              className="btn-primary"
              style={{ marginTop: 24 }}
              onClick={() => {
                setSuccessMsg(null)
                setDelegateName('')
                setDelegateEmail('')
                setSelectedPlatforms([])
                setDurationOption(1)
                setCustomExpiry('')
              }}
            >
              Grant Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <label
                style={{ display: 'block', color: '#86EFAC', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
              >
                Delegate Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Sarah (VA)"
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                style={{ display: 'block', color: '#86EFAC', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
              >
                Delegate Email <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="e.g. sarah@example.com"
                value={delegateEmail}
                onChange={(e) => setDelegateEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Platforms */}
            <div>
              <label
                style={{ display: 'block', color: '#86EFAC', fontSize: 13, fontWeight: 600, marginBottom: 10 }}
              >
                Platforms <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: active ? 'rgba(201,168,76,0.20)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(201,168,76,0.60)' : '1px solid rgba(255,255,255,0.10)',
                        color: active ? '#C9A84C' : '#86EFAC',
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label
                style={{ display: 'block', color: '#86EFAC', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
              >
                Duration
              </label>
              <select
                className="input-field"
                value={durationOption}
                onChange={(e) => setDurationOption(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom datetime */}
            {durationOption === -1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  style={{ display: 'block', color: '#86EFAC', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                >
                  Custom Expiry <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  className="input-field"
                  type="datetime-local"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  style={{ width: '100%' }}
                />
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={createMutation.isPending}
              style={{ padding: '14px', fontWeight: 700, marginTop: 8 }}
            >
              {createMutation.isPending ? 'Generating...' : 'Generate Secure Link & Send Email'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  )
}

// ─── Activity Log Panel ───────────────────────────────────────────────────────

interface ActivityPanelProps {
  delegation: Delegation
  onClose: () => void
}

function ActivityPanel({ delegation, onClose }: ActivityPanelProps) {
  const { data: activity = DEMO_ACTIVITY } = useQuery<ActivityEntry[]>({
    queryKey: ['delegation-activity', delegation.id],
    queryFn: async () => {
      const { data } = await api.get(`/api/access/delegations/${delegation.id}/activity`)
      return data
    },
    placeholderData: DEMO_ACTIVITY,
  })

  return (
    <motion.div
      key="activity-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 480,
        maxWidth: '100vw',
        background: '#0A2422',
        borderLeft: '1px solid rgba(201,168,76,0.20)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          position: 'sticky',
          top: 0,
          background: '#0A2422',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} style={{ color: '#2DD4BF' }} />
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: 18,
                color: '#F0FDF4',
              }}
            >
              Activity Log
            </span>
          </div>
          <p style={{ color: '#86EFAC', fontSize: 13, marginTop: 2 }}>
            {delegation.delegate_name} — {delegation.delegate_email}
          </p>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: '6px 8px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px', flex: 1 }}>
        {activity.length === 0 ? (
          <p style={{ color: '#86EFAC', fontSize: 14, textAlign: 'center', marginTop: 48 }}>
            No activity recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingBottom: i < activity.length - 1 ? 20 : 0,
                  marginBottom: i < activity.length - 1 ? 20 : 0,
                  borderBottom: i < activity.length - 1 ? '1px solid rgba(201,168,76,0.08)' : 'none',
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background:
                        entry.action === 'password_revealed'
                          ? '#F59E0B'
                          : entry.action === 'session_expired' || entry.action === 'revoked'
                          ? '#EF4444'
                          : '#2DD4BF',
                      marginTop: 3,
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#F0FDF4', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                    {entry.platform && (
                      <span style={{ color: '#C9A84C', fontWeight: 400 }}> — {entry.platform}</span>
                    )}
                  </p>
                  <p style={{ color: '#86EFAC', fontSize: 12 }}>
                    {formatTimestamp(entry.performed_at)}
                    {entry.ip_address && (
                      <span style={{ marginLeft: 8, color: '#4B5563' }}>IP: {entry.ip_address}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Delegation Card ──────────────────────────────────────────────────────────

interface DelegationCardProps {
  delegation: Delegation
  onViewActivity: (d: Delegation) => void
  onRevoke: (id: string, name: string) => void
}

function DelegationCard({ delegation, onViewActivity, onRevoke }: DelegationCardProps) {
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px 28px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Left */}
        <div>
          <p
            style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: 18,
              color: '#F0FDF4',
              marginBottom: 4,
            }}
          >
            {delegation.delegate_name}
          </p>
          <p style={{ color: '#86EFAC', fontSize: 13, marginBottom: 12 }}>
            {delegation.delegate_email}
          </p>

          {/* Platform badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {delegation.platforms.map((p) => (
              <span
                key={p}
                style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(45,212,191,0.12)',
                  border: '1px solid rgba(45,212,191,0.25)',
                  color: '#2DD4BF',
                }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* Countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Clock size={13} style={{ color: '#C9A84C' }} />
            <CountdownTimer expiresAt={delegation.expires_at} />
          </div>
        </div>

        {/* Right — status badge */}
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background:
              delegation.status === 'active'
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(239,68,68,0.12)',
            border:
              delegation.status === 'active'
                ? '1px solid rgba(34,197,94,0.35)'
                : '1px solid rgba(239,68,68,0.35)',
            color: delegation.status === 'active' ? '#22C55E' : '#EF4444',
            flexShrink: 0,
          }}
        >
          {delegation.status}
        </span>
      </div>

      {/* Actions */}
      {!confirmRevoke ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            className="btn-ghost"
            onClick={() => onViewActivity(delegation)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Activity size={14} />
            View Activity Log
          </button>
          <button
            className="btn-danger"
            onClick={() => setConfirmRevoke(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Trash2 size={14} />
            Revoke Access
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 12,
            padding: '16px 20px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10,
          }}
        >
          <p style={{ color: '#F0FDF4', fontSize: 14, marginBottom: 12 }}>
            Are you sure?{' '}
            <strong style={{ color: '#EF4444' }}>{delegation.delegate_name}</strong>'s access
            will be removed immediately.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={() => setConfirmRevoke(false)}
            >
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                setConfirmRevoke(false)
                onRevoke(delegation.id, delegation.delegate_name)
              }}
            >
              Revoke
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Past Delegation Row ──────────────────────────────────────────────────────

interface PastDelegationRowProps {
  delegation: Delegation
  onMarkChanged: (id: string) => void
  isMarkingChanged: boolean
}

function PastDelegationRow({ delegation, onMarkChanged, isMarkingChanged }: PastDelegationRowProps) {
  const showReminder = !delegation.password_changed_after

  return (
    <div
      style={{
        padding: '18px 24px',
        border: '1px solid rgba(201,168,76,0.12)',
        borderRadius: 10,
        background: '#0A2422',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p style={{ color: '#F0FDF4', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
            {delegation.delegate_name}
            <span style={{ color: '#4B5563', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              {delegation.delegate_email}
            </span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {delegation.platforms.map((p) => (
              <span
                key={p}
                style={{
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(134,239,172,0.08)',
                  border: '1px solid rgba(134,239,172,0.18)',
                  color: '#86EFAC',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <span
          style={{
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'rgba(107,114,128,0.15)',
            border: '1px solid rgba(107,114,128,0.25)',
            color: '#6B7280',
          }}
        >
          {delegation.status}
        </span>
      </div>

      {/* Password change reminder */}
      {showReminder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 8,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ color: '#F59E0B', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} />
            You haven't changed your{' '}
            <strong>{delegation.platforms.join(', ')}</strong> password yet after{' '}
            <strong>{delegation.delegate_name}</strong>'s session.
          </p>
          <button
            className="btn-ghost"
            onClick={() => onMarkChanged(delegation.id)}
            disabled={isMarkingChanged}
            style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
          >
            <CheckCircle size={12} style={{ marginRight: 4, display: 'inline' }} />
            Mark as Changed
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SharedAccess() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const isPro =
    user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise'

  const [showGrantPanel, setShowGrantPanel] = useState(false)
  const [activityDelegation, setActivityDelegation] = useState<Delegation | null>(null)
  const [pastExpanded, setPastExpanded] = useState(false)

  // Backdrop click closes panels
  const anyPanelOpen = showGrantPanel || !!activityDelegation

  // Fetch delegations
  const { data: delegations = DEMO_DELEGATIONS as Delegation[] } = useQuery<Delegation[]>({
    queryKey: ['delegations'],
    queryFn: async () => {
      const { data } = await api.get('/api/access/delegations')
      return data
    },
    placeholderData: DEMO_DELEGATIONS as Delegation[],
    enabled: isPro,
  })

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/access/delegations/${id}`)
    },
    onSuccess: (_, _id) => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
      toast.success('Access revoked', 'The delegation has been removed.')
    },
    onError: () => {
      toast.error('Failed to revoke', 'Please try again.')
    },
  })

  // Mark password changed mutation
  const markChangedMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/access/delegations/${id}/password-changed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] })
      toast.success('Marked as changed', 'Password change recorded.')
    },
    onError: () => {
      toast.error('Failed to update', 'Please try again.')
    },
  })

  const activeDelegations = delegations.filter((d) => d.status === 'active')
  const pastDelegations = delegations.filter(
    (d) => d.status === 'expired' || d.status === 'revoked'
  )

  return (
    <div style={{ minHeight: '100vh', background: '#071E1C', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Page heading */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #E4C46A, #C9A84C, #9A7A35)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 48px)',
            letterSpacing: '-1px',
            marginBottom: 8,
          }}
        >
          SHARED ACCESS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#86EFAC', fontSize: 15, marginBottom: 40 }}
        >
          Secure, time-limited credential sharing for your team
        </motion.p>

        {/* ── Free / Standard gate ────────────────────────────────────────── */}
        {!isPro && <UpgradeGate />}

        {/* ── Pro view ────────────────────────────────────────────────────── */}
        {isPro && (
          <>
            {/* Section A — Active Delegations */}
            <section style={{ marginBottom: 36 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    fontSize: 20,
                    color: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Users size={18} style={{ color: '#C9A84C' }} />
                  Active Delegations
                  {activeDelegations.length > 0 && (
                    <span
                      style={{
                        marginLeft: 4,
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.30)',
                        color: '#22C55E',
                      }}
                    >
                      {activeDelegations.length}
                    </span>
                  )}
                </h2>

                {/* Section B — Grant button */}
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActivityDelegation(null)
                    setShowGrantPanel(true)
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Plus size={16} />
                  Grant Temporary Access
                </button>
              </div>

              {activeDelegations.length === 0 ? (
                <div
                  className="card-static"
                  style={{
                    padding: '36px',
                    textAlign: 'center',
                    color: '#86EFAC',
                    fontSize: 14,
                  }}
                >
                  <Shield size={32} style={{ color: '#C9A84C', margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: '#F0FDF4', marginBottom: 4 }}>
                    No active delegations
                  </p>
                  <p>Grant temporary access to a team member to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeDelegations.map((d) => (
                    <DelegationCard
                      key={d.id}
                      delegation={d}
                      onViewActivity={(del) => {
                        setShowGrantPanel(false)
                        setActivityDelegation(del)
                      }}
                      onRevoke={(id, name) => {
                        revokeMutation.mutate(id)
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Section D — Past Delegations */}
            {pastDelegations.length > 0 && (
              <section>
                <button
                  onClick={() => setPastExpanded((v) => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    marginBottom: pastExpanded ? 16 : 0,
                  }}
                >
                  <ChevronRight
                    size={18}
                    style={{
                      color: '#C9A84C',
                      transform: pastExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#86EFAC',
                    }}
                  >
                    Past Delegations
                  </span>
                  <span
                    style={{
                      marginLeft: 4,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(107,114,128,0.15)',
                      border: '1px solid rgba(107,114,128,0.25)',
                      color: '#6B7280',
                    }}
                  >
                    {pastDelegations.length}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {pastExpanded && (
                    <motion.div
                      key="past"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {pastDelegations.map((d) => (
                        <PastDelegationRow
                          key={d.id}
                          delegation={d}
                          onMarkChanged={(id) => markChangedMutation.mutate(id)}
                          isMarkingChanged={markChangedMutation.isPending}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {anyPanelOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowGrantPanel(false)
              setActivityDelegation(null)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7,30,28,0.60)',
              backdropFilter: 'blur(2px)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Panels ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGrantPanel && (
          <GrantPanel
            key="grant-panel"
            onClose={() => setShowGrantPanel(false)}
          />
        )}
        {activityDelegation && (
          <ActivityPanel
            key="activity-panel"
            delegation={activityDelegation}
            onClose={() => setActivityDelegation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
