import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Failed to send reset email', 'Try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a password reset link if that email is registered.">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle className="w-8 h-8 text-safe" />
          </div>
          <p className="text-text-secondary text-sm">Didn't receive it? Check your spam folder or try again.</p>
          <Link to="/login" className="btn-ghost w-full flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} />
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Send reset link
        </Button>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </form>
    </AuthLayout>
  )
}
