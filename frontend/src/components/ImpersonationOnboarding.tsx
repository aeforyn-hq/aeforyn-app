import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { supabase } from '@/lib/supabase'

interface Props {
  onComplete: () => void
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: 'E1306C' },
  { id: 'tiktok', label: 'TikTok', color: '69C9D0' },
  { id: 'youtube', label: 'YouTube', color: 'FF0000' },
  { id: 'x', label: 'X (Twitter)', color: 'FFFFFF' },
  { id: 'facebook', label: 'Facebook', color: '1877F2' },
  { id: 'linkedin', label: 'LinkedIn', color: '0A66C2' },
]

export function ImpersonationOnboarding({ onComplete }: Props) {
  const [handles, setHandles] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const entries = Object.entries(handles).filter(([, h]) => h.trim())
    try {
      for (const [platform, handle] of entries) {
        await api.post('/api/impersonation/handles', { platform, handle: handle.trim() })
      }
      // Mark onboarding complete in Supabase profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').update({ has_completed_impersonation_onboarding: true }).eq('id', user.id)
      }
      toast.success('Handles saved', 'AEFORYN will now monitor for imposters.')
      onComplete()
    } catch {
      toast.error('Could not save handles. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').update({ has_completed_impersonation_onboarding: true }).eq('id', user.id)
      }
    } catch { /* non-fatal */ }
    onComplete()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,22,20,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg"
          style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', padding: '40px' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <button onClick={handleSkip} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #E4C46A, #C9A84C, #9A7A35)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
            Let's protect your identity
          </h2>
          <p className="text-text-secondary text-sm mb-8 leading-relaxed">
            Register your handles so AEFORYN knows who you are — and can spot anyone pretending to be you.
          </p>

          <div className="space-y-3 mb-8">
            {PLATFORMS.map(({ id, label, color }) => (
              <div key={id} className="flex items-center gap-3">
                <img
                  src={`https://cdn.simpleicons.org/${id}/${color}`}
                  alt={label}
                  width={20} height={20}
                  className="flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-sm text-text-secondary w-24 flex-shrink-0">{label}</span>
                <input
                  type="text"
                  placeholder={`@your${label.toLowerCase().replace(' ', '')}handle`}
                  value={handles[id] || ''}
                  onChange={(e) => setHandles((prev) => ({ ...prev, [id]: e.target.value }))}
                  className="input-field flex-1 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="btn-ghost flex-1 py-2.5 text-sm"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={saving || Object.values(handles).every((h) => !h.trim())}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save & Start Protecting'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
