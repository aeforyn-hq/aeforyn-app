import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, User, Settings, CreditCard, LogOut, HelpCircle, RefreshCw, ChevronDown, Shield, AlertTriangle, Info } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

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

const DEMO_NOTIFICATIONS = [
  { id: '1', type: 'threat', title: 'Critical threat detected', body: 'Login attempt from unknown device on Instagram', time: '15m ago', read: false },
  { id: '2', type: 'alert', title: 'Phishing email blocked', body: 'Suspicious brand deal email quarantined', time: '2h ago', read: false },
  { id: '3', type: 'info', title: 'Security score updated', body: 'Your security score improved to 78/100', time: '1d ago', read: true },
]

const PLAN_LABELS: Record<string, string> = { free: 'Free', standard: 'Standard', pro: 'Pro', enterprise: 'Enterprise' }

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const title = PAGE_TITLES[pathname] || 'AEFORYN'
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AE'

  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const plan = (user as any)?.plan || 'free'

  return (
    <header
      className="h-16 flex items-center justify-between px-8 flex-shrink-0 border-b"
      style={{ background: '#071E1C', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0FDF4', letterSpacing: '-0.5px', textShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setAvatarOpen(false) }}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
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
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(45,212,191,0.06)' }}>
                {DEMO_NOTIFICATIONS.map(n => (
                  <div
                    key={n.id}
                    className="px-4 py-3 flex gap-3 hover:bg-white/3 transition-colors cursor-pointer"
                    style={{ opacity: n.read ? 0.6 : 1 }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {n.type === 'threat' && <AlertTriangle className="w-4 h-4 text-threat" />}
                      {n.type === 'alert' && <Shield className="w-4 h-4 text-warning" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-teal" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#F0FDF4', fontSize: '13px', fontWeight: 600 }}>{n.title}</p>
                      <p style={{ color: '#86EFAC', fontSize: '12px', lineHeight: 1.4, marginTop: '2px' }}>{n.body}</p>
                      <p style={{ color: 'rgba(134,239,172,0.5)', fontSize: '11px', marginTop: '4px' }}>{n.time}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-3">
                <button
                  className="w-full text-xs text-center transition-colors"
                  style={{ color: '#2DD4BF' }}
                  onClick={() => setNotifOpen(false)}
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + user menu */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => { setAvatarOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-white/5 transition-all"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}
            >
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>

          {avatarOpen && (
            <div
              className="absolute right-0 top-13 w-64 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)', top: '52px' }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
                <p className="truncate" style={{ color: '#F0FDF4', fontSize: '13px', fontWeight: 600 }}>{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    {PLAN_LABELS[plan] || 'Free'} Plan
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {[
                  { icon: User, label: 'Profile', action: () => navigate('/settings') },
                  { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                  { icon: CreditCard, label: 'Billing', action: () => navigate('/billing') },
                  { icon: RefreshCw, label: 'Switch Plan', action: () => navigate('/billing') },
                  { icon: HelpCircle, label: 'Help & Support', action: () => window.open('mailto:support@aeforyn.com') },
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
