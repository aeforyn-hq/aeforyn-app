// Demo data for when API is not connected
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Activity, HardDrive, ArrowRight, Clock, ScanLine, LifeBuoy, Bot, UserX, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SeverityBadge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { formatBytes, timeAgo, getScoreColor, PLATFORM_LABELS } from '@/lib/utils'
import type { DashboardData } from '@/types'

const DEMO_IMPERSONATION = { active: 2, recent: '@aeforyn.official on TikTok' }
const DEMO_DELEGATION = { active: 1, delegate: 'Sarah (VA)', expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }

const DEMO_DATA: DashboardData = {
  security_score: 78,
  threats_summary: { critical: 2, high: 2, medium: 2, low: 1, total: 8, resolved: 2 },
  platforms: [
    { id: '1', user_id: 'demo', platform: 'instagram', handle: '@creatorhandle', health_score: 85, status: 'safe', connected_at: new Date().toISOString() },
    { id: '2', user_id: 'demo', platform: 'tiktok', handle: '@creatorhandle', health_score: 72, status: 'warning', connected_at: new Date().toISOString() },
    { id: '3', user_id: 'demo', platform: 'youtube', handle: 'Creator Channel', health_score: 91, status: 'safe', connected_at: new Date().toISOString() },
    { id: '4', user_id: 'demo', platform: 'x', handle: '@creatorhandle', health_score: 55, status: 'warning', connected_at: new Date().toISOString() },
  ],
  recent_threats: [
    { id: '1', user_id: 'demo', threat_type: 'login_attempt', platform: 'instagram', severity: 'critical', title: 'Login attempt from Lagos, Nigeria', description: 'Unrecognised device attempted to access your Instagram account.', location: 'Lagos, Nigeria', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*15).toISOString() },
    { id: '2', user_id: 'demo', threat_type: 'phishing', platform: 'email', severity: 'high', title: 'Brand deal phishing email detected', description: 'Email from "partnerships@brands-hub.co" offering $5,000 brand deal — confirmed phishing.', location: 'Email', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
    { id: '3', user_id: 'demo', threat_type: 'suspicious_access', platform: 'tiktok', severity: 'medium', title: 'Unusual login time on TikTok', description: 'Login at 3:47 AM from your usual device.', location: 'Cape Town, ZA', is_resolved: false, detected_at: new Date(Date.now() - 1000*60*60*8).toISOString() },
  ],
  recent_files: [
    { id: '1', user_id: 'demo', file_name: 'Q4_Brand_Deal_Contract.pdf', file_type: 'application/pdf', file_size_bytes: 2400000, r2_key: 'demo/1.pdf', category: 'document', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
    { id: '2', user_id: 'demo', file_name: 'YouTube_Nov_Analytics.mp4', file_type: 'video/mp4', file_size_bytes: 450000000, r2_key: 'demo/2.mp4', category: 'video', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
    { id: '3', user_id: 'demo', file_name: 'Instagram_Passwords_2024.pdf', file_type: 'application/pdf', file_size_bytes: 180000, r2_key: 'demo/3.pdf', category: 'credential', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*48).toISOString() },
  ],
  storage_used: 12884901888,
  storage_total: 53687091200,
}

function SecurityScoreRing({ score }: { score: number }) {
  const color = getScoreColor(score)
  const circumference = 2 * Math.PI * 45
  const strokeDash = (score / 100) * circumference

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color }}>
          {score}
        </span>
        <p className="text-xs text-text-secondary">/100</p>
      </div>
    </div>
  )
}

const severityColors: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#22C55E',
}

export default function Dashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/api/monitoring/dashboard')
      return data
    },
    placeholderData: DEMO_DATA,
  })

  const { data: impersonationAlerts } = useQuery({
    queryKey: ['impersonation-alerts-count'],
    queryFn: async () => {
      const { data } = await api.get<Array<{ status: string }>>('/api/impersonation/alerts')
      return data
    },
    placeholderData: [{ status: 'active' }, { status: 'active' }],
  })

  const { data: delegations } = useQuery({
    queryKey: ['delegations-dashboard'],
    queryFn: async () => {
      const { data } = await api.get<Array<{ status: string; delegate_name: string; expires_at: string }>>('/api/access/delegations')
      return data
    },
    placeholderData: [{ status: 'active', delegate_name: DEMO_DELEGATION.delegate, expires_at: DEMO_DELEGATION.expiresAt }],
  })

  const d = dashboard || DEMO_DATA
  const storagePercent = Math.round((d.storage_used / d.storage_total) * 100)
  const activeAlertCount = (impersonationAlerts || []).filter((a) => a.status === 'active' || a.status === 'monitoring').length
  const activeDelegations = (delegations || []).filter((d) => d.status === 'active')

  const fileIconColor: Record<string, string> = {
    video: '#2DD4BF', image: '#C9A84C', document: '#86EFAC', credential: '#F59E0B', other: '#9CA3AF', general: '#9CA3AF',
  }

  return (
    <div className="space-y-8">
      {/* Stat cards row — all cards are clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <Link to="/threats" className="block">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="card cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>Security Score</span>
              <Shield className="w-4 h-4 text-gold" />
            </div>
            <div className="flex justify-center">
              <SecurityScoreRing score={d.security_score} />
            </div>
            <p className="text-center text-xs text-text-secondary mt-2">
              {d.security_score >= 80 ? 'Well protected' : d.security_score >= 60 ? 'Needs attention' : 'At risk'}
            </p>
          </motion.div>
        </Link>

        <Link to="/threats" className="block">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>Threats Blocked</span>
              <AlertTriangle className="w-4 h-4 text-warning-color" />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: '#C9A84C', lineHeight: 1 }}>
              {d.threats_summary.resolved}
            </p>
            <div className="mt-3 space-y-1.5">
              {Object.entries({ critical: d.threats_summary.critical, high: d.threats_summary.high, medium: d.threats_summary.medium }).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary capitalize">{k}</span>
                  <span style={{ color: severityColors[k], fontFamily: 'JetBrains Mono, monospace' }}>{v} active</span>
                </div>
              ))}
            </div>
          </motion.div>
        </Link>

        <Link to="/monitoring" className="block">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>Platforms</span>
              <Activity className="w-4 h-4 text-teal" />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: '#2DD4BF', lineHeight: 1 }}>
              {d.platforms.length}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.platforms.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <StatusDot status={p.status} size="sm" />
                  <span className="text-xs text-text-secondary capitalize">{p.platform}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </Link>

        <Link to="/vault" className="block">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>Vault Storage</span>
              <HardDrive className="w-4 h-4 text-gold" />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: '#C9A84C', lineHeight: 1 }}>
              {storagePercent}%
            </p>
            <div className="mt-3">
              <ProgressBar value={storagePercent} color="gold" size="md" />
              <p className="text-xs text-text-secondary mt-2 mono-text">
                {formatBytes(d.storage_used)} / {formatBytes(d.storage_total)}
              </p>
            </div>
          </motion.div>
        </Link>

        {/* 5th stat: Impersonation Alerts */}
        <Link to="/impersonation" className="block">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card cursor-pointer"
            style={activeAlertCount > 0 ? { boxShadow: '0 0 16px rgba(255,100,50,0.4)', borderColor: 'rgba(239,68,68,0.3)' } : {}}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>Impersonation</span>
              <UserX className={`w-4 h-4 ${activeAlertCount > 0 ? 'text-threat' : 'text-text-secondary'}`} />
            </div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: activeAlertCount > 0 ? '#EF4444' : '#86EFAC', lineHeight: 1 }}>
              {activeAlertCount}
            </p>
            <p className="text-xs mt-3" style={{ color: activeAlertCount > 0 ? '#EF4444' : '#86EFAC' }}>
              {activeAlertCount > 0 ? 'Active alerts' : 'No alerts'}
            </p>
            {activeAlertCount > 0 && (
              <p className="text-xs text-text-secondary mt-1 truncate">{DEMO_IMPERSONATION.recent}</p>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Shared Access widget */}
      {activeDelegations.length > 0 && (
        <Link to="/shared-access" className="block">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="card cursor-pointer flex items-center gap-4"
            style={{ borderColor: 'rgba(45,212,191,0.2)', background: 'rgba(45,212,191,0.04)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
              <Users className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {activeDelegations[0].delegate_name} has active access
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Expires {timeAgo(activeDelegations[0].expires_at)} — click to manage
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-teal flex-shrink-0" />
          </motion.div>
        </Link>
      )}

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Live threat feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="xl:col-span-3 card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="heading-card">Live Threats</h2>
              {d.threats_summary.total > 0 && (
                <span className="badge-threat">{d.threats_summary.critical + d.threats_summary.high + d.threats_summary.medium + d.threats_summary.low} active</span>
              )}
            </div>
            <Link to="/threats" className="text-xs text-teal hover:text-teal-mid flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {d.recent_threats.length === 0 ? (
            <div className="text-center py-10">
              <Shield className="w-12 h-12 text-safe mx-auto mb-3" />
              <p className="text-safe font-medium">All clear. Your accounts are protected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {d.recent_threats.map((threat) => (
                <div key={threat.id} className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(45,212,191,0.06)' }}>
                  <StatusDot status={threat.severity as 'critical' | 'warning' | 'threat'} pulse size="md" className="mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary truncate">{threat.title}</p>
                      <SeverityBadge severity={threat.severity} />
                    </div>
                    <p className="text-xs text-text-secondary truncate">{threat.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {threat.platform && <span className="text-xs text-gold capitalize">{PLATFORM_LABELS[threat.platform] || threat.platform}</span>}
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Clock className="w-3 h-3" /> {timeAgo(threat.detected_at)}
                      </span>
                    </div>
                  </div>
                  <Link to="/threats" className="flex-shrink-0 text-xs text-teal hover:text-teal-mid">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Platform health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-card">Platform Health</h2>
            <Link to="/monitoring" className="text-xs text-teal hover:text-teal-mid flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {d.platforms.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={p.status} size="sm" />
                    <span className="text-sm font-medium text-text-primary capitalize">{PLATFORM_LABELS[p.platform] || p.platform}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: getScoreColor(p.health_score) }}>
                    {p.health_score}
                  </span>
                </div>
                <ProgressBar
                  value={p.health_score}
                  color={p.health_score >= 80 ? 'gold' : p.health_score >= 60 ? 'warning' : 'threat'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent vault files */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-card">Recent Vault Files</h2>
          <Link to="/vault" className="text-xs text-teal hover:text-teal-mid flex items-center gap-1 transition-colors">
            Open vault <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {d.recent_files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${fileIconColor[file.category]}15` }}>
                <HardDrive className="w-5 h-5" style={{ color: fileIconColor[file.category] }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary">{formatBytes(file.file_size_bytes)}</span>
                  <span className="badge-teal py-0 text-[10px]">ENCRYPTED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <h2 className="heading-card mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { to: '/scanner', icon: ScanLine, title: 'Scan a Message', desc: 'Check any DM or email for phishing', color: '#2DD4BF' },
            { to: '/recovery', icon: LifeBuoy, title: 'Start Recovery', desc: 'Guided account recovery flow', color: '#C9A84C' },
            { to: '/vault', icon: HardDrive, title: 'Upload to Vault', desc: 'Backup your creator content', color: '#86EFAC' },
            { to: '/ai', icon: Bot, title: 'Ask AI', desc: 'Get instant security advice', color: '#C9A84C' },
          ].map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to}>
              <Card className="group cursor-pointer h-full" hover>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-gold transition-colors group-hover:translate-x-1 transform duration-150" />
                </div>
                <p className="heading-card text-sm mb-1">{title}</p>
                <p className="text-xs text-text-secondary">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
