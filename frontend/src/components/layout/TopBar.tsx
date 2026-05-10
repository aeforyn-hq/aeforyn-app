import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/threats': 'Threat Center',
  '/monitoring': 'Platform Monitoring',
  '/vault': 'Content Vault',
  '/scanner': 'Phishing Scanner',
  '/recovery': 'Account Recovery',
  '/ai': 'AI Assistant',
  '/settings': 'Settings',
  '/billing': 'Billing & Plans',
}

export function TopBar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const title = PAGE_TITLES[pathname] || 'AEFORYN'
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AE'

  return (
    <header
      className="h-16 flex items-center justify-between px-8 flex-shrink-0 border-b"
      style={{ background: '#081208', borderColor: 'rgba(45,212,191,0.08)' }}
    >
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0FDF4', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-threat" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#050D0A' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
