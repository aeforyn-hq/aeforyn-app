import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Shield,
  Plus,
  X,
  ChevronRight,
  Lock,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { hasFeature } from '@/lib/utils'
import { Link } from 'react-router-dom'

// ─── Platform definitions ────────────────────────────────────────────────────

const PLATFORM_SLUGS: Record<string, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  youtube: 'youtube',
  x: 'x',
  facebook: 'facebook',
  snapchat: 'snapchat',
  threads: 'threads',
  bluesky: 'bluesky',
  linkedin: 'linkedin',
  github: 'github',
  medium: 'medium',
  substack: 'substack',
  behance: 'behance',
  dribbble: 'dribbble',
  discord: 'discord',
  twitch: 'twitch',
  reddit: 'reddit',
  telegram: 'telegram',
  mastodon: 'mastodon',
  patreon: 'patreon',
  onlyfans: 'onlyfans',
  shopify: 'shopify',
  etsy: 'etsy',
  gumroad: 'gumroad',
  kofi: 'kofi',
  buymeacoffee: 'buymeacoffee',
  fiverr: 'fiverr',
  upwork: 'upwork',
  gmail: 'gmail',
  whatsapp: 'whatsapp',
  spotify: 'spotify',
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'E1306C',
  tiktok: '69C9D0',
  youtube: 'FF0000',
  x: 'FFFFFF',
  facebook: '1877F2',
  snapchat: 'FFFC00',
  threads: 'FFFFFF',
  bluesky: '0085FF',
  linkedin: '0A66C2',
  github: 'FFFFFF',
  medium: 'FFFFFF',
  substack: 'FF6719',
  behance: '1769FF',
  dribbble: 'EA4C89',
  discord: '5865F2',
  twitch: '9146FF',
  reddit: 'FF4500',
  telegram: '2CA5E0',
  mastodon: '6364FF',
  patreon: 'FF424D',
  onlyfans: '00AFF0',
  shopify: '96BF48',
  etsy: 'F1641E',
  gumroad: '36A9AE',
  kofi: '29ABE0',
  buymeacoffee: 'FFDD00',
  fiverr: '1DBF73',
  upwork: '6FDA44',
  gmail: 'EA4335',
  whatsapp: '25D366',
  spotify: '1DB954',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  snapchat: 'Snapchat',
  threads: 'Threads',
  bluesky: 'Bluesky',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  medium: 'Medium',
  substack: 'Substack',
  behance: 'Behance',
  dribbble: 'Dribbble',
  discord: 'Discord',
  twitch: 'Twitch',
  reddit: 'Reddit',
  telegram: 'Telegram',
  mastodon: 'Mastodon',
  patreon: 'Patreon',
  onlyfans: 'OnlyFans',
  shopify: 'Shopify',
  etsy: 'Etsy',
  gumroad: 'Gumroad',
  kofi: 'Ko-fi',
  buymeacoffee: 'Buy Me a Coffee',
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  gmail: 'Gmail (Email)',
  whatsapp: 'WhatsApp',
  spotify: 'Spotify',
}

// ─── Categories ───────────────────────────────────────────────────────────────

type Category = 'all' | 'Social Media' | 'Professional' | 'Community' | 'Commerce & Monetization' | 'Communication'

const CATEGORIES: Category[] = [
  'all',
  'Social Media',
  'Professional',
  'Community',
  'Commerce & Monetization',
  'Communication',
]

const PLATFORM_CATEGORIES: Record<string, Category> = {
  instagram: 'Social Media',
  tiktok: 'Social Media',
  youtube: 'Social Media',
  x: 'Social Media',
  facebook: 'Social Media',
  snapchat: 'Social Media',
  threads: 'Social Media',
  bluesky: 'Social Media',
  linkedin: 'Professional',
  github: 'Professional',
  medium: 'Professional',
  substack: 'Professional',
  behance: 'Professional',
  dribbble: 'Professional',
  discord: 'Community',
  twitch: 'Community',
  reddit: 'Community',
  telegram: 'Community',
  mastodon: 'Community',
  patreon: 'Commerce & Monetization',
  onlyfans: 'Commerce & Monetization',
  shopify: 'Commerce & Monetization',
  etsy: 'Commerce & Monetization',
  gumroad: 'Commerce & Monetization',
  kofi: 'Commerce & Monetization',
  buymeacoffee: 'Commerce & Monetization',
  fiverr: 'Commerce & Monetization',
  upwork: 'Commerce & Monetization',
  gmail: 'Communication',
  whatsapp: 'Communication',
  spotify: 'Communication',
}

const ALL_PLATFORM_KEYS = Object.keys(PLATFORM_LABELS)

// ─── Demo connected data ──────────────────────────────────────────────────────

interface ConnectedPlatform {
  id: string
  platform: string
  handle: string
  health_score: number
  status: 'safe' | 'warning' | 'threat'
  last_checked_at: string
}

const DEMO_CONNECTED: ConnectedPlatform[] = [
  { id: '1', platform: 'instagram', handle: '@creatorhandle', health_score: 85, status: 'safe', last_checked_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', platform: 'tiktok', handle: '@creatorhandle', health_score: 72, status: 'warning', last_checked_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: '3', platform: 'youtube', handle: 'Creator Channel', health_score: 91, status: 'safe', last_checked_at: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  { id: '4', platform: 'x', handle: '@creatorhandle', health_score: 55, status: 'warning', last_checked_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '5', platform: 'discord', handle: 'CreatorServer#0001', health_score: 88, status: 'safe', last_checked_at: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: '6', platform: 'patreon', handle: 'patreon.com/creator', health_score: 79, status: 'safe', last_checked_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: '7', platform: 'gmail', handle: 'creator@gmail.com', health_score: 61, status: 'warning', last_checked_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: '8', platform: 'linkedin', handle: 'Creator Name', health_score: 90, status: 'safe', last_checked_at: new Date(Date.now() - 1000 * 60 * 7).toISOString() },
]

const DEMO_EVENTS: Record<string, { time: string; text: string; type: 'safe' | 'warning' | 'threat' }[]> = {
  instagram: [
    { time: '5 min ago', text: 'Routine health check passed', type: 'safe' },
    { time: '2 hours ago', text: 'Login from recognised device', type: 'safe' },
    { time: '1 day ago', text: 'Password not changed in 90 days', type: 'warning' },
  ],
  tiktok: [
    { time: '10 min ago', text: 'Suspicious login attempt blocked', type: 'warning' },
    { time: '4 hours ago', text: 'New authorised app detected', type: 'warning' },
    { time: '2 days ago', text: 'Routine health check passed', type: 'safe' },
  ],
  youtube: [
    { time: '3 min ago', text: 'Routine health check passed', type: 'safe' },
    { time: '1 hour ago', text: '2FA verified active', type: 'safe' },
    { time: '3 days ago', text: 'Content backup completed', type: 'safe' },
  ],
  x: [
    { time: '15 min ago', text: 'Unrecognised login location flagged', type: 'threat' },
    { time: '6 hours ago', text: 'Third-party app access reviewed', type: 'warning' },
    { time: '1 day ago', text: '2FA not enabled — action recommended', type: 'warning' },
  ],
  discord: [
    { time: '8 min ago', text: 'Routine health check passed', type: 'safe' },
    { time: '3 hours ago', text: 'Server permissions reviewed', type: 'safe' },
    { time: '2 days ago', text: 'Bot integrations audited', type: 'safe' },
  ],
  patreon: [
    { time: '12 min ago', text: 'Routine health check passed', type: 'safe' },
    { time: '5 hours ago', text: 'Payout settings verified', type: 'safe' },
    { time: '3 days ago', text: 'Account recovery email updated', type: 'warning' },
  ],
  gmail: [
    { time: '20 min ago', text: 'Phishing email detected and flagged', type: 'warning' },
    { time: '2 hours ago', text: 'Unusual forwarding rule detected', type: 'warning' },
    { time: '1 day ago', text: 'Routine health check passed', type: 'safe' },
  ],
  linkedin: [
    { time: '7 min ago', text: 'Routine health check passed', type: 'safe' },
    { time: '1 hour ago', text: 'Profile viewed from new location', type: 'safe' },
    { time: '4 days ago', text: '2FA verified active', type: 'safe' },
  ],
}

// ─── Tier limits ─────────────────────────────────────────────────────────────

function getTierLimit(planTier: string): number {
  if (planTier === 'free') return 3
  if (planTier === 'standard') return 10
  return Infinity
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function getHealthColor(score: number): string {
  if (score > 80) return '#2DD4BF'
  if (score > 60) return '#F59E0B'
  return '#EF4444'
}

function getStatusLabel(status: 'safe' | 'warning' | 'threat'): string {
  if (status === 'safe') return 'Safe'
  if (status === 'warning') return 'Warning'
  return 'Threat'
}

function getStatusColors(status: 'safe' | 'warning' | 'threat'): { bg: string; border: string; text: string } {
  if (status === 'safe') return { bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.3)', text: '#2DD4BF' }
  if (status === 'warning') return { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' }
  return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' }
}

function PlatformIcon({ platform, size = 24 }: { platform: string; size?: number }) {
  const slug = PLATFORM_SLUGS[platform] || platform
  const color = PLATFORM_COLORS[platform] || 'FFFFFF'
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color}`}
      alt={PLATFORM_LABELS[platform] || platform}
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

function HealthRing({ score, size = 64 }: { score: number; size?: number }) {
  const color = getHealthColor(score)
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <span
        className="absolute"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: size > 56 ? '16px' : '12px', color }}
      >
        {score}
      </span>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  platform,
  onClose,
}: {
  platform: ConnectedPlatform
  onClose: () => void
}) {
  const events = DEMO_EVENTS[platform.platform] || [
    { time: 'recently', text: 'Health check completed', type: 'safe' as const },
  ]
  const statusColors = getStatusColors(platform.status)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
        style={{ background: '#0A2422', borderLeft: '1px solid rgba(201,168,76,0.2)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'rgba(45,212,191,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `#${PLATFORM_COLORS[platform.platform]}18`, border: `1px solid #${PLATFORM_COLORS[platform.platform]}30` }}
            >
              <PlatformIcon platform={platform.platform} size={20} />
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#F0FDF4',
              }}
            >
              {PLATFORM_LABELS[platform.platform]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Handle', value: platform.handle },
              { label: 'Last Checked', value: timeAgo(platform.last_checked_at) },
              {
                label: 'Status',
                value: getStatusLabel(platform.status),
                color: statusColors.text,
              },
              { label: 'Category', value: PLATFORM_CATEGORIES[platform.platform] },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-3 rounded-xl"
                style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}
              >
                <p
                  className="uppercase mb-1"
                  style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#86EFAC' }}
                >
                  {label}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: color || '#F0FDF4', wordBreak: 'break-all' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Health score ring */}
          <div
            className="flex items-center gap-5 p-4 rounded-2xl"
            style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}
          >
            <HealthRing score={platform.health_score} size={80} />
            <div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '22px',
                  color: getHealthColor(platform.health_score),
                }}
              >
                {platform.health_score}/100
              </p>
              <p className="text-sm" style={{ color: '#86EFAC' }}>Health Score</p>
              <p className="text-xs mt-1" style={{ color: '#86EFAC' }}>
                {platform.health_score > 80
                  ? 'This account is in good health.'
                  : platform.health_score > 60
                  ? 'Some issues detected — review events.'
                  : 'Action recommended — check events below.'}
              </p>
            </div>
          </div>

          {/* Recent events */}
          <div>
            <p
              className="uppercase mb-3"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1.5px',
                color: '#C9A84C',
              }}
            >
              Recent Events
            </p>
            <div className="space-y-2">
              {events.map((ev, i) => {
                const Icon =
                  ev.type === 'safe'
                    ? CheckCircle
                    : ev.type === 'warning'
                    ? AlertTriangle
                    : AlertTriangle
                const iconColor =
                  ev.type === 'safe'
                    ? '#2DD4BF'
                    : ev.type === 'warning'
                    ? '#F59E0B'
                    : '#EF4444'
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(45,212,191,0.07)',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: '#F0FDF4' }}>{ev.text}</p>
                      <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#86EFAC' }}>
                        <Clock className="w-3 h-3" /> {ev.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'rgba(45,212,191,0.08)',
              border: '1px solid rgba(45,212,191,0.2)',
              color: '#2DD4BF',
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── Connected Platform Card ──────────────────────────────────────────────────

function ConnectedCard({
  platform,
  onDetails,
  onDisconnect,
  index,
}: {
  platform: ConnectedPlatform
  onDetails: () => void
  onDisconnect: () => void
  index: number
}) {
  const statusColors = getStatusColors(platform.status)
  const healthColor = getHealthColor(platform.health_score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: '#0A2422',
        border: '1px solid rgba(201,168,76,0.15)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.30)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(201,168,76,0.12)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.15)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `#${PLATFORM_COLORS[platform.platform]}15`,
              border: `1px solid #${PLATFORM_COLORS[platform.platform]}28`,
            }}
          >
            <PlatformIcon platform={platform.platform} size={22} />
          </div>
          <div>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                color: '#F0FDF4',
              }}
            >
              {PLATFORM_LABELS[platform.platform]}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#86EFAC' }}>{platform.handle}</p>
          </div>
        </div>
        <HealthRing score={platform.health_score} size={60} />
      </div>

      {/* Status badge + last checked */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: statusColors.bg,
            border: `1px solid ${statusColors.border}`,
            color: statusColors.text,
          }}
        >
          {getStatusLabel(platform.status)}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: '#86EFAC' }}>
          <Clock className="w-3 h-3" />
          {timeAgo(platform.last_checked_at)}
        </span>
      </div>

      {/* Health score bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs" style={{ color: '#86EFAC' }}>Health</span>
          <span className="text-xs font-semibold" style={{ color: healthColor }}>{platform.health_score}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${platform.health_score}%`, background: healthColor }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between pt-1"
        style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}
      >
        <button
          onClick={onDetails}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: '#C9A84C' }}
        >
          Details <ExternalLink className="w-3 h-3" />
        </button>
        <button
          onClick={onDisconnect}
          className="text-xs px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444',
          }}
        >
          Disconnect
        </button>
      </div>
    </motion.div>
  )
}

// ─── Available Platform Card ──────────────────────────────────────────────────

function AvailableCard({
  platformKey,
  locked,
  onConnect,
  index,
}: {
  platformKey: string
  locked: boolean
  onConnect: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all duration-200"
      style={{
        background: locked ? 'rgba(10,36,34,0.5)' : '#0A2422',
        border: '1px solid rgba(201,168,76,0.08)',
        opacity: locked ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!locked) {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.20)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(201,168,76,0.07)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.08)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `rgba(255,255,255,0.04)`,
            border: '1px solid rgba(255,255,255,0.07)',
            filter: locked ? 'grayscale(1)' : 'none',
          }}
        >
          <PlatformIcon platform={platformKey} size={18} />
        </div>
        <div>
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: locked ? '#86EFAC60' : '#86EFAC',
            }}
          >
            {PLATFORM_LABELS[platformKey]}
          </p>
          <p className="text-xs" style={{ color: '#86EFAC40' }}>
            {PLATFORM_CATEGORIES[platformKey]}
          </p>
        </div>
      </div>

      {locked ? (
        <Link
          to="/billing"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            color: '#C9A84C',
          }}
        >
          <Lock className="w-3 h-3" /> Upgrade
        </Link>
      ) : (
        <button
          onClick={onConnect}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{
            background: 'rgba(45,212,191,0.08)',
            border: '1px solid rgba(45,212,191,0.2)',
            color: '#2DD4BF',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Connect
        </button>
      )}
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Monitoring() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [detailPlatform, setDetailPlatform] = useState<ConnectedPlatform | null>(null)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    new Set(DEMO_CONNECTED.map((p) => p.platform))
  )
  const [connectedList, setConnectedList] = useState<ConnectedPlatform[]>(DEMO_CONNECTED)

  const { user } = useAuthStore()
  const planTier = user?.plan_tier || 'free'
  const tierLimit = getTierLimit(planTier)
  const isUnlimited = tierLimit === Infinity

  // Fetch from API but fall back to demo data
  useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await api.get<ConnectedPlatform[]>('/api/monitoring/platforms')
      if (data && data.length > 0) {
        setConnectedList(data)
        setConnectedIds(new Set(data.map((p) => p.platform)))
      }
      return data
    },
    placeholderData: DEMO_CONNECTED,
  })

  const connectedCount = connectedList.length

  // Filter platforms by search + category
  const filteredAvailable = ALL_PLATFORM_KEYS.filter((key) => {
    if (connectedIds.has(key)) return false
    const label = PLATFORM_LABELS[key] || key
    const cat = PLATFORM_CATEGORIES[key] || ''
    const matchesSearch =
      !search ||
      label.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || PLATFORM_CATEGORIES[key] === activeCategory
    return matchesSearch && matchesCategory
  })

  const filteredConnected = connectedList.filter((p) => {
    const label = PLATFORM_LABELS[p.platform] || p.platform
    const cat = PLATFORM_CATEGORIES[p.platform] || ''
    const matchesSearch =
      !search ||
      label.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase()) ||
      p.handle.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || PLATFORM_CATEGORIES[p.platform] === activeCategory
    return matchesSearch && matchesCategory
  })

  function handleDisconnect(platform: ConnectedPlatform) {
    if (!confirm(`Disconnect ${PLATFORM_LABELS[platform.platform]}?`)) return
    setConnectedIds((prev) => {
      const next = new Set(prev)
      next.delete(platform.platform)
      return next
    })
    setConnectedList((prev) => prev.filter((p) => p.id !== platform.id))
  }

  function handleConnect(platformKey: string) {
    if (!isUnlimited && connectedCount >= tierLimit) return
    const newPlatform: ConnectedPlatform = {
      id: `new-${platformKey}`,
      platform: platformKey,
      handle: `@${platformKey}user`,
      health_score: 70,
      status: 'safe',
      last_checked_at: new Date().toISOString(),
    }
    setConnectedIds((prev) => new Set([...prev, platformKey]))
    setConnectedList((prev) => [...prev, newPlatform])
  }

  const avgScore =
    connectedList.length > 0
      ? Math.round(connectedList.reduce((s, p) => s + p.health_score, 0) / connectedList.length)
      : 0

  const tierLabel =
    planTier === 'free'
      ? 'Free — 3 platforms max'
      : planTier === 'standard'
      ? 'Standard — 10 platforms max'
      : 'Pro — Unlimited'

  const catTabColor = '#C9A84C'

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"
        style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="flex items-center gap-5">
          <Shield className="w-8 h-8" style={{ color: '#C9A84C' }} />
          <div>
            <p
              className="uppercase mb-0.5"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1.5px',
                color: '#C9A84C',
              }}
            >
              Platform Monitoring
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '26px', color: '#F0FDF4' }}>
              {connectedCount} Connected
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#86EFAC' }}>
              Avg. health score:{' '}
              <span style={{ color: getHealthColor(avgScore), fontWeight: 600 }}>{avgScore}/100</span>
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: isUnlimited || connectedCount < tierLimit
              ? 'rgba(45,212,191,0.07)'
              : 'rgba(239,68,68,0.07)',
            border: `1px solid ${isUnlimited || connectedCount < tierLimit ? 'rgba(45,212,191,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {(!isUnlimited && connectedCount >= tierLimit) ? (
            <Lock className="w-4 h-4" style={{ color: '#EF4444' }} />
          ) : (
            <CheckCircle className="w-4 h-4" style={{ color: '#2DD4BF' }} />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: (!isUnlimited && connectedCount >= tierLimit) ? '#EF4444' : '#2DD4BF' }}
          >
            {tierLabel}
            {!isUnlimited && ` · ${connectedCount}/${tierLimit} used`}
          </span>
          {!isUnlimited && connectedCount >= tierLimit && (
            <Link
              to="/billing"
              className="ml-2 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
            >
              Upgrade
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#86EFAC60' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search platforms or categories…"
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: '#0A2422',
            border: '1px solid rgba(45,212,191,0.15)',
            color: '#F0FDF4',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.4)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(45,212,191,0.15)')}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: '#86EFAC' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
              style={{
                background: active ? `${catTabColor}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${catTabColor}45` : 'rgba(45,212,191,0.1)'}`,
                color: active ? catTabColor : '#86EFAC',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          )
        })}
      </div>

      {/* Connected platforms */}
      {filteredConnected.length > 0 && (
        <div>
          <p
            className="uppercase mb-4"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#C9A84C',
            }}
          >
            Connected · {filteredConnected.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredConnected.map((p, i) => (
              <ConnectedCard
                key={p.id}
                platform={p}
                index={i}
                onDetails={() => setDetailPlatform(p)}
                onDisconnect={() => handleDisconnect(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available platforms */}
      {filteredAvailable.length > 0 && (
        <div>
          <p
            className="uppercase mb-4"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#86EFAC80',
            }}
          >
            Available to Connect · {filteredAvailable.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredAvailable.map((key, i) => {
              const overLimit = !isUnlimited && connectedCount >= tierLimit
              return (
                <AvailableCard
                  key={key}
                  platformKey={key}
                  locked={overLimit}
                  onConnect={() => handleConnect(key)}
                  index={i}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredConnected.length === 0 && filteredAvailable.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="w-12 h-12 mx-auto mb-4" style={{ color: '#86EFAC40' }} />
          <p
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              color: '#F0FDF4',
            }}
          >
            No platforms match your search.
          </p>
          <p className="text-sm mt-2" style={{ color: '#86EFAC' }}>
            Try a different search term or category.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all') }}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#C9A84C',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Upgrade CTA if at limit */}
      {!isUnlimited && connectedCount >= tierLimit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#C9A84C' }} />
            <div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#F0FDF4',
                }}
              >
                Platform limit reached
              </p>
              <p className="text-sm mt-0.5" style={{ color: '#86EFAC' }}>
                You're on the{' '}
                <span style={{ color: '#C9A84C', textTransform: 'capitalize' }}>{planTier}</span> plan
                ({tierLimit} platform{tierLimit !== 1 ? 's' : ''} max). Upgrade to monitor more.
              </p>
            </div>
          </div>
          <Link
            to="/billing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80 flex-shrink-0"
            style={{
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#C9A84C',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Upgrade plan <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {detailPlatform && (
          <DetailDrawer
            platform={detailPlatform}
            onClose={() => setDetailPlatform(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
