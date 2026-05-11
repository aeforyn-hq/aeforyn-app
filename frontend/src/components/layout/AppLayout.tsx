import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ImpersonationOnboarding } from '@/components/ImpersonationOnboarding'
import { ImpersonationAlertOverlay } from '@/components/ImpersonationAlertOverlay'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

export function AppLayout() {
  const { user } = useAuthStore()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    // Check if user has completed impersonation onboarding
    supabase
      .from('users')
      .select('has_completed_impersonation_onboarding')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && data.has_completed_impersonation_onboarding === false) {
          setTimeout(() => setShowOnboarding(true), 1500)
        }
      }, () => { /* non-fatal */ })
  }, [user?.id])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#071E1C' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      {showOnboarding && (
        <ImpersonationOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {!showOnboarding && <ImpersonationAlertOverlay />}
    </div>
  )
}
