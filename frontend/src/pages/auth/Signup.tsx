import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AtSign, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'email', label: 'Email' },
]

export default function Signup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [handle, setHandle] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('All fields required'); return }
    if (password !== confirmPw) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/signup', {
        email,
        password,
        creator_handle: handle || undefined,
        platforms: selectedPlatforms,
      })
      setStep(3)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Signup failed'
      toast.error('Signup failed', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={step === 3 ? 'Check your email' : 'Create your account'} subtitle={
      step === 1 ? 'Protect your creator accounts in minutes.' :
      step === 2 ? 'Tell us about your platforms so we can monitor them.' :
      'We sent a verification link to ' + email
    }>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleStep1}
            className="space-y-5"
          >
            <div className="flex gap-2 mb-4">
              {[1,2,3].map((s) => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: s <= step ? '#C9A84C' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} />
            <Input label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" icon={<Lock className="w-4 h-4" />}
              rightElement={<button type="button" onClick={() => setShowPw(!showPw)} className="text-text-secondary hover:text-text-primary"><EyeOff className="w-4 h-4" /></button>} />
            <Input label="Confirm password" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat password" icon={<Lock className="w-4 h-4" />} />

            <Button type="submit" variant="primary" className="w-full mt-2">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-teal hover:text-teal-mid transition-colors font-medium">Sign in</Link>
            </p>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleStep2}
            className="space-y-5"
          >
            <div className="flex gap-2 mb-4">
              {[1,2,3].map((s) => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: s <= step ? '#C9A84C' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            <Input label="Creator handle (optional)" type="text" value={handle} onChange={(e) => setHandle(e.target.value)}
              placeholder="@yourhandle" icon={<AtSign className="w-4 h-4" />} />

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '1.5px' }}>
                Platforms you use
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
                      selectedPlatforms.includes(p.id)
                        ? 'text-gold bg-gold-subtle border border-gold'
                        : 'text-text-secondary border hover:text-text-primary hover:bg-white/5'
                    )}
                    style={{ borderColor: selectedPlatforms.includes(p.id) ? 'rgba(201,168,76,0.6)' : 'rgba(45,212,191,0.15)' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                Create account
              </Button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Mail className="w-8 h-8 text-safe" />
            </div>
            <div className="space-y-2">
              <p className="text-text-secondary text-sm">Click the link in your email to activate your account. Check your spam folder if you don't see it.</p>
            </div>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Go to sign in
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
