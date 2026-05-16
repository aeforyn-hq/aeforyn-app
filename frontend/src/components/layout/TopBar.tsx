import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Settings, CreditCard, LogOut, ChevronDown, Shield, AlertTriangle, Info, CheckCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AvatarDisplay } from '@/components/ui/AvatarSVG'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/threats': 'Threat Center',
  '/impersonation': 'Impersonation Detection',
  '/shared-access': 'Shared Access',
  '/monitoring': 'Platform Monitoring',
  '/vault': 'Content Vault',
  '/scanner': 'Phishing Scanner',
  '/recovery': 'Account Recovery',
  '/ai': 'AI Assistant',
  '/settings': 'Settings',
  '/billing': 'Billing & Plans',
}

const NOTIF_KEY = 'aeforyn_notifications'

interface Notification {
  id: string
  type: 'threat' | 'alert' | 'info'
  title: string
  body: string
  time: string
  read: boolean
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'threat', title: 'Critical threat detected', body: 'Login attempt from unknown device on Instagram', time: '15m ago', read: false },
  { id: '2', type: 'alert', title: 'Phishing email blocked', body: 'Suspicious brand deal email quarantined', time: '2h ago', read: false },
  { id: '3', type: 'info', title: 'Security score updated', body: 'Your security score improved to 78/100', time: '1d ago', read: true },
]

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY)
    if (stored) return JSON.parse(stored) as Notification[]
  } catch {}
  return DEFAULT_NOTIFICATIONS
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs))
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', standard: 'Standard', creator: 'Creator', pro: 'Pro', agency: 'Agency', enterprise: 'Enterprise',
}

/** Shared avatar component — handles photo, illustrated, and initials */
export function AvatarOrInitials({
  avatarUrl, initials, size = 36,
  avatarType = 'initials', illustratedAvatarId = 'a1',
}: {
  avatarUrl: string | null
  initials: string
  size?: number
  avatarType?: 'initials' | 'illustrated' | 'photo'
  illustratedAvatarId?: string
}) {
  if (avatarType === 'photo' && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Profile"
        style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  if (avatarType === 'illustrated') {
    return (
      <div style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
        <AvatarDisplay id={illustratedAvatarId} size={size} />
      </div>
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.36),
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '0.5px',
      }}
    >
      {initials}
    </div>
  )
}

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout, avatarUrl, avatarType, illustratedAvatarId } = useAuthStore()
  const title = PAGE_TITLES[pathname] || 'AEFORYN'

  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications)
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const hasUnread = notifications.some((n) => !n.read)

  // Derive initials
  const handle = user?.creator_handle || ''
  const parts = handle.replace('@', '').split(/[\s_-]/).filter(Boolean)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (user?.email?.charAt(0) || 'A').toUpperCase()

  const planTier = user?.plan_tier || 'free'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markRead(id: string) {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
    saveNotifications(updated)
  }

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    saveNotifications(updated)
  }

  function handleNotifClick(n: Notification) {
    markRead(n.id)
    setNotifOpen(false)
    navigate('/threats')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-8 flex-shrink-0 border-b"
      style={{ background: '#071E1C', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0FDF4', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false) }}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-threat" />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl z-50"
              style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)' }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F0FDF4', fontSize: '14px' }}>Notifications</span>
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs transition-colors hover:text-teal"
                  style={{ color: '#2DD4BF' }}
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className="px-4 py-3 flex gap-3 hover:bg-white/3 transition-colors cursor-pointer"
                    style={{ opacity: n.read ? 0.5 : 1 }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {n.type === 'threat' && <AlertTriangle className="w-4 h-4 text-threat" />}
                      {n.type === 'alert' && <Shield className="w-4 h-4 text-warning" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-teal" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: n.read ? '#86EFAC' : '#F0FDF4', fontSize: '13px', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                      <p style={{ color: '#86EFAC', fontSize: '12px', lineHeight: 1.4, marginTop: '2px' }}>{n.body}</p>
                      <p style={{ color: 'rgba(134,239,172,0.5)', fontSize: '11px', marginTop: '4px' }}>{n.time}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + user menu */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => { setAvatarOpen((o) => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-white/5 transition-all"
          >
            <AvatarOrInitials avatarUrl={avatarUrl} initials={initials} size={36} avatarType={avatarType} illustratedAvatarId={illustratedAvatarId} />
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>

          {avatarOpen && (
            <div
              className="absolute right-0 w-60 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)', top: '52px' }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
                <AvatarOrInitials avatarUrl={avatarUrl} initials={initials} size={40} avatarType={avatarType} illustratedAvatarId={illustratedAvatarId} />
                <div className="min-w-0">
                  <p className="truncate" style={{ color: '#F0FDF4', fontSize: '13px', fontWeight: 600 }}>
                    {user?.creator_handle || user?.email}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    {PLAN_LABELS[planTier] || 'Free'} Plan
                  </span>
                </div>
              </div>

              {/* 3 menu items only */}
              <div className="py-1">
                {[
                  { icon: Settings, label: 'Profile & Settings', action: () => navigate('/settings') },
                  { icon: CreditCard, label: 'Billing & Plans', action: () => navigate('/billing') },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={() => { action(); setAvatarOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-text-secondary" />
                    <span style={{ color: '#86EFAC', fontSize: '13px' }}>{label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t py-1" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-threat" />
                  <span style={{ color: '#EF4444', fontSize: '13px' }}>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
