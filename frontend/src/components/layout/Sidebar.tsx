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
import { AvatarDisplay } from '@/components/ui/AvatarSVG'
import type { AvatarId } from '@/components/ui/AvatarSVG'
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
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [proTooltip, setProTooltip] = useState<string | null>(null)

  const isPro = user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AE'
  const avatarId = ((user as { avatar?: string })?.avatar as AvatarId) || null

  return (
    <aside
      className="w-[260px] flex-shrink-0 flex flex-col h-full border-r"
      style={{ background: '#051614', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      {/* Logo */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <AeforynLogo size="md" showWordmark showTagline clickable />
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}
        >
          {avatarId ? (
            <AvatarDisplay id={avatarId} size={32} />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-primary truncate">
              {user?.creator_handle || user?.email?.split('@')[0] || 'Creator'}
            </p>
            <PlanBadge plan={user?.plan_tier || 'free'} className="mt-0.5" />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, proOnly, premium }) => {
          const isLocked = proOnly && !isPro
          return (
            <div key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                    premium
                      ? isActive
                        ? 'bg-teal/5'
                        : 'hover:bg-teal/5'
                      : isActive
                        ? 'text-gold bg-gold-subtle border-l-2 border-gold pl-[10px]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )
                }
                style={premium ? { border: '1px solid rgba(45,212,191,0.15)', borderRadius: '12px', marginBottom: '2px' } : {}}
              >
                {({ isActive }) => (
                  <>
                    {premium ? (
                      /* Pulsating hex icon for premium items */
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <motion.div
                          className="absolute inset-0"
                          animate={{ opacity: [0.4, 0.85, 0.4] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ filter: 'drop-shadow(0 0 4px #2DD4BF)' }}
                        >
                          <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
                            <polygon
                              points="10,2 17,5.5 17,14.5 10,18 3,14.5 3,5.5"
                              fill={isActive ? 'rgba(45,212,191,0.2)' : 'rgba(45,212,191,0.08)'}
                              stroke="#2DD4BF"
                              strokeWidth="1"
                            />
                          </svg>
                        </motion.div>
                        <Icon className="absolute inset-0 m-auto w-3 h-3" style={{ color: isActive ? '#2DD4BF' : 'rgba(45,212,191,0.7)' }} />
                      </div>
                    ) : (
                      <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-gold' : 'text-text-secondary group-hover:text-text-primary')} />
                    )}

                    {/* Label — teal metallic for premium */}
                    <span
                      className="flex-1 relative"
                      style={premium ? {
                        background: 'linear-gradient(180deg, #7EEADB 0%, #2DD4BF 50%, #1AA090 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: 'none',
                        fontWeight: 600,
                        letterSpacing: '0.2px',
                      } : {}}
                    >
                      {/* 3D shadow layer for premium */}
                      {premium && (
                        <span
                          aria-hidden
                          className="absolute"
                          style={{
                            top: '1.5px',
                            left: '1px',
                            background: 'linear-gradient(180deg, #0A5A52, #074A42)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            userSelect: 'none',
                          }}
                        >
                          {label}
                        </span>
                      )}
                      {label}
                    </span>

                    {/* Gold underline for premium */}
                    {premium && (
                      <motion.div
                        className="absolute bottom-0 left-3 right-3 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }}
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
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
                        style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', fontSize: '10px', letterSpacing: '0.5px' }}
                      >
                        PRO
                      </button>
                    )}
                  </>
                )}
              </NavLink>

              {/* Pro tooltip */}
              {isLocked && proTooltip === to && (
                <div
                  className="mx-2 mt-1 mb-1 p-3 rounded-xl relative"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <button
                    onClick={() => setProTooltip(null)}
                    className="absolute top-2 right-2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-text-secondary leading-relaxed pr-4">
                    {PRO_DESCRIPTIONS[to]}
                  </p>
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

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t space-y-0.5" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
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
    </aside>
  )
}
