import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser, setToken, logout } = useAuthStore()
  const navigate = useNavigate()

  // Always wipe any existing session when the login page mounts —
  // prevents one user ever seeing another user's data.
  useEffect(() => {
    localStorage.removeItem('aeforyn_token')
    localStorage.removeItem('aeforyn-auth')
    logout()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid email or password'
      toast.error('Login failed', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your AEFORYN account to continue protecting your accounts.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          icon={<Lock className="w-4 h-4" />}
          rightElement={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-text-secondary hover:text-text-primary transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-teal hover:text-teal-mid transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
          Sign in to AEFORYN
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal hover:text-teal-mid transition-colors font-medium">
            Create account
          </Link>
        </p>
      </form>

      {/* Demo hint */}
      <div className="mt-6 p-3 rounded-xl" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.1)' }}>
        <p className="text-xs text-text-secondary text-center mono-text">
          DEMO: demo@aeforyn.com / password123
        </p>
      </div>
    </AuthLayout>
  )
}
