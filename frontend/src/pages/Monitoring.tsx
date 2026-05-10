import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { StatusDot } from '@/components/ui/StatusDot'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { getScoreColor, getSecurityGrade, PLATFORM_LABELS, timeAgo } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import type { Platform } from '@/types'

const DEMO_PLATFORMS: Platform[] = [
  { id: '1', user_id: 'demo', platform: 'instagram', handle: '@creatorhandle', health_score: 85, status: 'safe', last_checked_at: new Date(Date.now() - 1000*60*5).toISOString(), connected_at: new Date(Date.now() - 1000*60*60*24*30).toISOString() },
  { id: '2', user_id: 'demo', platform: 'tiktok', handle: '@creatorhandle', health_score: 72, status: 'warning', last_checked_at: new Date(Date.now() - 1000*60*10).toISOString(), connected_at: new Date(Date.now() - 1000*60*60*24*20).toISOString() },
  { id: '3', user_id: 'demo', platform: 'youtube', handle: 'Creator Channel', health_score: 91, status: 'safe', last_checked_at: new Date(Date.now() - 1000*60*3).toISOString(), connected_at: new Date(Date.now() - 1000*60*60*24*60).toISOString() },
  { id: '4', user_id: 'demo', platform: 'x', handle: '@creatorhandle', health_score: 55, status: 'warning', last_checked_at: new Date(Date.now() - 1000*60*15).toISOString(), connected_at: new Date(Date.now() - 1000*60*60*24*10).toISOString() },
  { id: '5', user_id: 'demo', platform: 'linkedin', handle: 'Creator Name', health_score: 67, status: 'monitoring', last_checked_at: new Date(Date.now() - 1000*60*20).toISOString(), connected_at: new Date(Date.now() - 1000*60*60*24*5).toISOString() },
]

const ALL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'x', 'linkedin', 'email', 'facebook'] as const

const HEALTH_METRICS = [
  { key: 'login', label: 'Login monitoring', description: 'Watching for suspicious sign-ins' },
  { key: 'backup', label: 'Content backup', description: 'Recent vault uploads' },
  { key: '2fa', label: '2FA coverage', description: 'Two-factor authentication active' },
  { key: 'access', label: 'Access control', description: 'Authorised apps reviewed' },
]

function getMetricScore(platform: Platform, metric: string): number {
  const base = platform.health_score
  const offsets: Record<string, number> = { login: 5, backup: -15, '2fa': 10, access: -5 }
  return Math.min(100, Math.max(0, base + (offsets[metric] || 0)))
}

function HealthRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = getScoreColor(score)
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <span className="absolute" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: size > 60 ? '18px' : '13px', color }}>
        {score}
      </span>
    </div>
  )
}

export default function Monitoring() {
  const [addOpen, setAddOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [newPlatform, setNewPlatform] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const queryClient = useQueryClient()

  const { data: platforms = DEMO_PLATFORMS } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await api.get<Platform[]>('/api/monitoring/platforms')
      return data
    },
    placeholderData: DEMO_PLATFORMS,
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/monitoring/platforms', { platform: newPlatform, handle: newHandle })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      toast.success('Platform connected', `Now monitoring ${PLATFORM_LABELS[newPlatform] || newPlatform}`)
      setAddOpen(false)
      setNewPlatform('')
      setNewHandle('')
    },
    onError: () => toast.error('Failed to add platform'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/monitoring/platforms/${id}`) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platforms'] }); toast.success('Platform disconnected') },
  })

  const avgScore = platforms.length > 0 ? Math.round(platforms.reduce((s, p) => s + p.health_score, 0) / platforms.length) : 0
  const grade = getSecurityGrade(avgScore)
  const gradeColor = getScoreColor(avgScore)

  return (
    <div className="space-y-8">
      {/* Security grade header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2" style={{ letterSpacing: '1.5px' }}>
              Overall Security Grade
            </p>
            <div className="flex items-baseline gap-4">
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '72px', color: gradeColor, letterSpacing: '-2px', lineHeight: 1 }}>
                {grade}
              </span>
              <div>
                <p className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{avgScore}/100</p>
                <p className="text-text-secondary text-sm">across {platforms.length} platforms</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['platforms'] })}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> Add Platform
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Platform grid */}
      {platforms.length === 0 ? (
        <div className="text-center py-20">
          <Activity className="w-14 h-14 text-text-secondary mx-auto mb-4" />
          <p className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No platforms connected.</p>
          <p className="text-text-secondary text-sm mt-1">Add your first platform to start monitoring.</p>
          <Button variant="primary" className="mt-6" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Platform
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card group cursor-pointer"
              onClick={() => setSelectedPlatform(selectedPlatform?.id === platform.id ? null : platform)}
              style={{ borderColor: selectedPlatform?.id === platform.id ? 'rgba(201,168,76,0.4)' : undefined }}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={platform.status} pulse={platform.status === 'warning' || platform.status === 'threat'} size="md" />
                    <h3 className="font-semibold text-text-primary capitalize" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
                      {PLATFORM_LABELS[platform.platform] || platform.platform}
                    </h3>
                  </div>
                  {platform.handle && <p className="text-sm text-text-secondary">{platform.handle}</p>}
                  {platform.last_checked_at && (
                    <p className="text-xs text-text-secondary mt-1 mono-text">
                      Checked {timeAgo(platform.last_checked_at)}
                    </p>
                  )}
                </div>
                <HealthRing score={platform.health_score} size={72} />
              </div>

              <div className="space-y-2">
                {HEALTH_METRICS.slice(0, 2).map((metric) => {
                  const score = getMetricScore(platform, metric.key)
                  return (
                    <div key={metric.key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-secondary">{metric.label}</span>
                        <span className="text-xs mono-text" style={{ color: getScoreColor(score) }}>{score}</span>
                      </div>
                      <ProgressBar value={score} color={score >= 80 ? 'teal' : score >= 60 ? 'warning' : 'threat'} size="sm" />
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>
                <Badge variant={platform.status === 'safe' ? 'safe' : platform.status === 'warning' ? 'warning' : platform.status === 'threat' ? 'threat' : 'teal'}>
                  {platform.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPlatform(platform) }}
                    className="text-xs text-teal hover:text-teal-mid flex items-center gap-1 transition-colors"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Disconnect this platform?')) deleteMutation.mutate(platform.id) }}
                    className="text-xs text-text-secondary hover:text-threat transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Platform detail panel */}
      {selectedPlatform && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-section capitalize">{PLATFORM_LABELS[selectedPlatform.platform] || selectedPlatform.platform} — Security Breakdown</h2>
            <div className="flex items-center gap-3">
              <HealthRing score={selectedPlatform.health_score} size={56} />
              <button onClick={() => setSelectedPlatform(null)} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">✕</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {HEALTH_METRICS.map((metric) => {
              const score = getMetricScore(selectedPlatform, metric.key)
              return (
                <div key={metric.key} className="p-4 rounded-xl" style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{metric.label}</p>
                      <p className="text-xs text-text-secondary">{metric.description}</p>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: '20px', color: getScoreColor(score) }}>{score}</span>
                  </div>
                  <ProgressBar value={score} color={score >= 80 ? 'teal' : score >= 60 ? 'warning' : 'threat'} size="md" showLabel />
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Add Platform Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Connect a Platform" size="sm">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '1.5px' }}>Select Platform</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PLATFORMS.map((p) => {
                const connected = platforms.some((pl) => pl.platform === p)
                return (
                  <button
                    key={p}
                    onClick={() => !connected && setNewPlatform(p)}
                    disabled={connected}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left capitalize"
                    style={{
                      background: newPlatform === p ? 'rgba(201,168,76,0.1)' : connected ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${newPlatform === p ? 'rgba(201,168,76,0.5)' : 'rgba(45,212,191,0.1)'}`,
                      color: newPlatform === p ? '#C9A84C' : connected ? 'rgba(134,239,172,0.3)' : '#86EFAC',
                      cursor: connected ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {PLATFORM_LABELS[p] || p} {connected && '✓'}
                  </button>
                )
              })}
            </div>
          </div>
          <Input label="Handle / Username (optional)" value={newHandle} onChange={(e) => setNewHandle(e.target.value)} placeholder="@yourhandle" />
          <Button variant="primary" className="w-full" loading={addMutation.isPending} onClick={() => { if (newPlatform) addMutation.mutate() }} disabled={!newPlatform}>
            Connect Platform
          </Button>
        </div>
      </Modal>
    </div>
  )
}
