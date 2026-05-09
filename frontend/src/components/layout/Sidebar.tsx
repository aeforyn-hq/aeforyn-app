import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Shield, HardDrive, Activity, ScanLine,
  LifeBuoy, Bot, Settings, CreditCard, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { PlanBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/threats', icon: Shield, label: 'Threats' },
  { to: '/monitoring', icon: Activity, label: 'Monitoring' },
  { to: '/vault', icon: HardDrive, label: 'Vault' },
  { to: '/scanner', icon: ScanLine, label: 'Scanner' },
  { to: '/recovery', icon: LifeBuoy, label: 'Recovery' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
]

const BOTTOM_NAV = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AE'

  return (
    <aside
      className="w-[260px] flex-shrink-0 flex flex-col h-full border-r"
      style={{ background: '#081208', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      {/* Logo */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <AeforynLogo size="md" showWordmark showTagline />
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#050D0A' }}
          >
            {initials}
          </div>
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
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
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
                <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-gold' : 'text-text-secondary group-hover:text-text-primary')} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
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
