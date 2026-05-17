import { useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Shield, HardDrive, Activity, ScanLine,
  LifeBuoy, Bot, Settings, CreditCard, LogOut,
  UserX, Users, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { PlanBadge } from '@/components/ui/Badge'
import { AvatarOrInitials } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', proOnly: false, premium: false },
  { to: '/threats', icon: Shield, label: 'Threats', proOnly: false, premium: false },
  { to: '/impersonation', icon: UserX, label: 'Impersonation', proOnly: true, premium: true },
  { to: '/shared-access', icon: Users, label: 'Shared Access', proOnly: true, premium: true },
  { to: '/monitoring', icon: Activity, label: 'Monitoring', proOnly: false, premium: false },
  { to: '/vault', icon: HardDrive, label: 'Vault', proOnly: false, premium: false },
  { to: '/scanner', icon: ScanLine, label: 'Scanner', proOnly: false, premium: false },
  { to: '/recovery', icon: LifeBuoy, label: 'Recovery', proOnly: false, premium: false },
  { to: '/ai', icon: Bot, label: 'AI Assistant', proOnly: false, premium: false },
]

const BOTTOM_NAV = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
]

const PRO_DESCRIPTIONS: Record<string, string> = {
  '/impersonation': 'Detect fake accounts copying your handle, image, or bio across all platforms.',
  '/shared-access': 'Grant your VA or editor time-limited access to credentials — securely, without sharing via chat.',
}

export function Sidebar() {
  const { user, logout, avatarUrl } = useAuthStore()
  const navigate = useNavigate()
  const [proTooltip, setProTooltip] = useState<string | null>(null)

  const isPro = user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise' || user?.plan_tier === 'agency'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handle = user?.creator_handle || ''
  const parts = handle.replace('@', '').split(/[\s_-]/).filter(Boolean)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (user?.email?.charAt(0) || 'A').toUpperCase()

  return (
    <aside
      className="w-[260px] flex-shrink-0 flex flex-col h-full border-r"
      style={{ background: '#051614', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      {/* Logo */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <AeforynLogo size="md" showWordmark showTagline clickable />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5" style={{ paddingTop: '28px' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label, proOnly, premium }) => {
          const isLocked = proOnly && !isPro
          return (
            <div key={to} style={{ margin: '3px 8px' }}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                    premium
                      ? ''
                      : isActive
                        ? 'text-gold bg-gold-subtle border-l-2 border-gold pl-[10px]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )
                }
                style={({ isActive }) => premium ? {
                  border: '1px solid rgba(20,184,166,0.35)',
                  borderLeft: isActive ? '3px solid #14B8A6' : '1px solid rgba(20,184,166,0.35)',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  background: isActive ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.04)',
                  boxShadow: isActive ? '0 0 12px rgba(20,184,166,0.15), inset 0 0 12px rgba(20,184,166,0.05)' : '0 0 8px rgba(20,184,166,0.08)',
                  paddingLeft: isActive ? '10px' : undefined,
                } : {}}
              >
                {({ isActive }) => (
                  <>
                    {premium ? (
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <motion.div
                          className="absolute inset-0"
                          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }}
                        >
                          <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
                            <polygon
                              points="10,2 17,5.5 17,14.5 10,18 3,14.5 3,5.5"
                              fill={isActive ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)'}
                              stroke="#F59E0B"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </motion.div>
                        <Icon className="absolute inset-0 m-auto w-3 h-3" style={{ color: isActive ? '#F59E0B' : 'rgba(245,158,11,0.85)' }} />
                      </div>
                    ) : (
                      <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-gold' : 'text-text-secondary group-hover:text-text-primary')} />
                    )}

                    <span
                      className="flex-1"
                      style={premium ? {
                        background: 'linear-gradient(180deg, #5EEAD4 0%, #14B8A6 50%, #0D9488 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.5))',
                      } : {}}
                    >
                      {label}
                    </span>

                    {premium && (
                      <motion.div
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, transparent, #F59E0B 30%, #F59E0B 70%, transparent)' }}
                        animate={{ opacity: [0.6, 1, 0.6], scaleX: [0.85, 1, 0.85] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    {isLocked && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setProTooltip(proTooltip === to ? null : to)
                        }}
                        className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-bold"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid #F59E0B', boxShadow: '0 0 6px rgba(245,158,11,0.4)', fontSize: '10px', letterSpacing: '0.5px' }}
                      >
                        PRO
                      </button>
                    )}
                  </>
                )}
              </NavLink>

              {isLocked && proTooltip === to && (
                <div
                  className="mt-1 mb-1 p-3 rounded-xl relative"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <button onClick={() => setProTooltip(null)} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary">
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-text-secondary leading-relaxed pr-4">{PRO_DESCRIPTIONS[to]}</p>
                  <button
                    onClick={() => { navigate('/billing'); setProTooltip(null) }}
                    className="mt-2 w-full text-xs py-1.5 px-3 rounded-lg font-semibold transition-colors"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <div className="px-3 py-3 space-y-0.5">
          {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'text-gold bg-gold-subtle border-l-2 border-gold pl-[10px]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-gold' : 'text-text-secondary group-hover:text-text-primary')} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-threat hover:bg-threat/5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>

        {/* Bottom user row */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}
          >
            <AvatarOrInitials avatarUrl={avatarUrl} initials={initials} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">
                {user?.creator_handle || user?.email?.split('@')[0] || 'Creator'}
              </p>
              <PlanBadge plan={user?.plan_tier || 'free'} className="mt-0.5" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
