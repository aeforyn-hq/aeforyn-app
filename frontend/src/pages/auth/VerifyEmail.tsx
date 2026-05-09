import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function VerifyEmail() {
  return (
    <AuthLayout title="Email verified!" subtitle="Your account is ready. Sign in to start protecting your accounts.">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle className="w-8 h-8 text-safe" />
        </div>
        <p className="text-text-secondary text-sm">You're all set. AEFORYN is ready to protect your creator accounts.</p>
        <Link to="/login" className="btn-primary w-full flex items-center justify-center">
          Sign in to AEFORYN
        </Link>
      </div>
    </AuthLayout>
  )
}
