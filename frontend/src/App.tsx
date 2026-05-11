import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ToastContainer } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { CookieBanner } from '@/components/ui/CookieBanner'

import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import VerifyEmail from '@/pages/auth/VerifyEmail'

import Dashboard from '@/pages/Dashboard'
import Threats from '@/pages/Threats'
import Vault from '@/pages/Vault'
import Monitoring from '@/pages/Monitoring'
import PhishingScanner from '@/pages/PhishingScanner'
import Recovery from '@/pages/Recovery'
import AIAssistant from '@/pages/AIAssistant'
import Settings from '@/pages/Settings'
import Billing from '@/pages/Billing'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import Impersonation from '@/pages/Impersonation'
import SharedAccess from '@/pages/SharedAccess'
import DelegateAccess from '@/pages/DelegateAccess'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/delegate-access" element={<DelegateAccess />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/scanner" element={<PhishingScanner />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/impersonation" element={<Impersonation />} />
          <Route path="/shared-access" element={<SharedAccess />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
      <CookieBanner />
    </BrowserRouter>
  )
}
