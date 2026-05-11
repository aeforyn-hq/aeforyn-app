import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Alert {
  id: string
  platform: string
  fake_handle: string
  match_type: string
  status: string
}

const SEEN_KEY = 'aeforyn_seen_alerts'

function getSeenIds(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] }
}
function markSeen(id: string) {
  const seen = getSeenIds()
  if (!seen.includes(id)) localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
}

const MATCH_LABELS: Record<string, string> = {
  handle_match: 'handle',
  image_match: 'profile image',
  bio_match: 'bio',
  brand_match: 'brand name',
}

const PLATFORM_SLUGS: Record<string, { slug: string; color: string }> = {
  instagram: { slug: 'instagram', color: 'E1306C' },
  tiktok: { slug: 'tiktok', color: '69C9D0' },
  youtube: { slug: 'youtube', color: 'FF0000' },
  x: { slug: 'x', color: 'FFFFFF' },
  facebook: { slug: 'facebook', color: '1877F2' },
  linkedin: { slug: 'linkedin', color: '0A66C2' },
}

export function ImpersonationAlertOverlay() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [newAlert, setNewAlert] = useState<Alert | null>(null)
  const isPro = user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise'

  const { data: alerts } = useQuery({
    queryKey: ['impersonation-alerts-overlay'],
    queryFn: async () => {
      const { data } = await api.get<Alert[]>('/api/impersonation/alerts')
      return data
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 min
    enabled: !!user && isPro,
    placeholderData: [],
  })

  useEffect(() => {
    if (!alerts?.length) return
    const seen = getSeenIds()
    const unseen = alerts.filter((a) => a.status === 'active' && !seen.includes(a.id))
    if (unseen.length > 0) {
      setNewAlert(unseen[0])
    }
  }, [alerts])

  function dismiss() {
    if (newAlert) markSeen(newAlert.id)
    setNewAlert(null)
  }

  function goToImpersonation() {
    if (newAlert) markSeen(newAlert.id)
    setNewAlert(null)
    navigate('/impersonation')
  }

  if (!newAlert || !isPro) return null

  const platformInfo = PLATFORM_SLUGS[newAlert.platform] || { slug: newAlert.platform, color: '86EFAC' }
  const matchLabel = MATCH_LABELS[newAlert.match_type] || newAlert.match_type

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,16,14,0.92)', backdropFilter: 'blur(10px)' }}
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated cracked shield */}
          <div className="relative flex justify-center mb-8">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(239,68,68,0.3)',
                  '0 0 60px rgba(239,68,68,0.7)',
                  '0 0 20px rgba(239,68,68,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.4)' }}
            >
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
                {/* Shield outline */}
                <path d="M32 6L8 18v16c0 12 10 22 24 24 14-2 24-12 24-24V18L32 6z" stroke="#EF4444" strokeWidth="2" fill="rgba(239,68,68,0.15)" />
                {/* Crack lines */}
                <path d="M32 14 L28 30 L34 28 L30 46" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <path d="M28 30 L22 36" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </svg>
            </motion.div>
          </div>

          {/* Platform icon */}
          <div className="flex justify-center mb-4">
            <img
              src={`https://cdn.simpleicons.org/${platformInfo.slug}/${platformInfo.color}`}
              alt={newAlert.platform}
              width={24} height={24}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(24px, 5vw, 36px)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #E4C46A, #C9A84C)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
          }}>
            Someone is pretending to be you.
          </h2>

          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            A new account <strong style={{ color: '#F0FDF4' }}>{newAlert.fake_handle}</strong> was found on{' '}
            <strong style={{ color: '#F0FDF4' }} className="capitalize">{newAlert.platform}</strong> copying your{' '}
            <strong style={{ color: '#F0FDF4' }}>{matchLabel}</strong>.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={goToImpersonation}
              className="btn-primary w-full py-3"
              style={{ fontSize: '15px' }}
            >
              See What To Do
            </button>
            <button
              onClick={dismiss}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
