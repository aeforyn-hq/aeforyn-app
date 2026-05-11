import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'

interface Delegation {
  id: string
  delegate_name: string
  platforms: string[]
  password_changed_after: boolean
}

interface Props {
  delegation: Delegation | null
  onClose: () => void
}

const PASSWORD_CHANGE_GUIDES: Record<string, { steps: string[]; url: string; urlLabel: string }> = {
  instagram: {
    steps: [
      'Open the Instagram app and go to your profile',
      'Tap the menu (☰) → Settings and privacy',
      'Tap Accounts Centre → Password and security',
      'Tap Change password',
      'Enter your current password, then your new password twice',
      'Tap Save changes',
    ],
    url: 'https://www.instagram.com/accounts/password/change/',
    urlLabel: 'Change Instagram Password',
  },
  tiktok: {
    steps: [
      'Open TikTok and tap Profile (bottom right)',
      'Tap the menu (☰) → Settings and privacy',
      'Tap Security → Password',
      'Enter your current password and new password',
      'Tap Update password',
    ],
    url: 'https://www.tiktok.com/setting/',
    urlLabel: 'TikTok Security Settings',
  },
  youtube: {
    steps: [
      'Go to myaccount.google.com in a browser',
      'Tap Security → How you sign in to Google',
      'Tap Password',
      'Enter your current password',
      'Enter and confirm your new password',
      'Tap Change password',
    ],
    url: 'https://myaccount.google.com/signinoptions/password',
    urlLabel: 'Change Google Password',
  },
  x: {
    steps: [
      'Go to x.com and open Settings (⚙ menu)',
      'Tap Security and account access → Security',
      'Tap Change your password',
      'Enter current and new password',
      'Tap Save',
    ],
    url: 'https://x.com/settings/password',
    urlLabel: 'Change X Password',
  },
  facebook: {
    steps: [
      'Go to facebook.com → Settings & privacy → Settings',
      'Tap Security and Login',
      'Tap Change password',
      'Enter current and new password',
      'Tap Save Changes',
    ],
    url: 'https://www.facebook.com/settings?tab=security',
    urlLabel: 'Facebook Security Settings',
  },
  linkedin: {
    steps: [
      'Go to linkedin.com → Me → Settings & Privacy',
      'Tap Sign in & security',
      'Tap Change password',
      'Enter current and new password',
      'Tap Save',
    ],
    url: 'https://www.linkedin.com/psettings/account-access',
    urlLabel: 'LinkedIn Account Access Settings',
  },
}

function getGuide(platform: string) {
  const key = platform.toLowerCase().replace(' ', '').replace(/[^a-z]/g, '')
  return PASSWORD_CHANGE_GUIDES[key] || {
    steps: [
      `Open ${platform} on a trusted device`,
      'Go to Settings → Security or Account',
      'Find Password or Security settings',
      'Change your password to a new, unique one',
      'Save and log out of all other sessions',
    ],
    url: '',
    urlLabel: '',
  }
}

export function PasswordChangeGuide({ delegation, onClose }: Props) {
  const queryClient = useQueryClient()
  const [changedPlatforms, setChangedPlatforms] = useState<Record<string, boolean>>({})
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(
    delegation?.platforms[0] || null
  )

  const markChangedMutation = useMutation({
    mutationFn: async (delegationId: string) => {
      const { data } = await api.patch(`/api/access/delegations/${delegationId}/password-changed`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['access-delegations'] })
      toast.success('Marked as changed', 'Your password change has been recorded.')
    },
  })

  if (!delegation) return null

  const allChanged = delegation.platforms.every((p) => changedPlatforms[p])

  function handleMarkPlatformChanged(platform: string) {
    setChangedPlatforms((prev) => ({ ...prev, [platform]: true }))
  }

  function handleMarkAllChanged() {
    if (!delegation) return
    const allMarked: Record<string, boolean> = {}
    delegation.platforms.forEach((p) => { allMarked[p] = true })
    setChangedPlatforms(allMarked)
    markChangedMutation.mutate(delegation.id)
  }

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col overflow-hidden"
          style={{ background: '#0A2422', borderLeft: '1px solid rgba(201,168,76,0.2)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: '#F0FDF4' }}>
                Time to Change Your Passwords
              </h2>
              <p className="text-xs text-text-secondary mt-1">{delegation.delegate_name}'s session has ended</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              Best practice: change your password on every platform that was shared. AEFORYN will track which ones you've done.
            </div>

            {delegation.platforms.map((platform) => {
              const guide = getGuide(platform)
              const isDone = changedPlatforms[platform]
              const isExpanded = expandedPlatform === platform

              return (
                <div
                  key={platform}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: isDone ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(201,168,76,0.15)',
                    background: isDone ? 'rgba(34,197,94,0.04)' : '#0A2422',
                  }}
                >
                  <button
                    onClick={() => setExpandedPlatform(isExpanded ? null : platform)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isDone
                        ? <CheckCircle className="w-5 h-5 text-safe" />
                        : <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(201,168,76,0.4)' }} />
                      }
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: isDone ? '#22C55E' : '#F0FDF4' }}>
                        {platform}
                      </span>
                    </div>
                    <span style={{ color: '#86EFAC', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>
                          <ol className="space-y-2 pt-3">
                            {guide.steps.map((step, i) => (
                              <li key={i} className="flex gap-3 text-sm">
                                <span
                                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                                  style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', fontSize: '10px' }}
                                >
                                  {i + 1}
                                </span>
                                <span style={{ color: '#86EFAC', lineHeight: 1.5 }}>{step}</span>
                              </li>
                            ))}
                          </ol>

                          {guide.url && (
                            <a
                              href={guide.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs transition-colors hover:underline"
                              style={{ color: '#2DD4BF' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {guide.urlLabel} ↗
                            </a>
                          )}

                          {!isDone && (
                            <button
                              onClick={() => handleMarkPlatformChanged(platform)}
                              className="w-full py-2 rounded-lg text-sm font-semibold transition-colors mt-2"
                              style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
                            >
                              <CheckCircle className="w-4 h-4 inline mr-2" />
                              Mark as Changed
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t" style={{ borderColor: 'rgba(45,212,191,0.1)' }}>
            {allChanged ? (
              <button
                onClick={handleMarkAllChanged}
                disabled={markChangedMutation.isPending || delegation.password_changed_after}
                className="btn-primary w-full"
              >
                {markChangedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {delegation.password_changed_after ? 'All passwords changed ✓' : 'Confirm All Changed'}
              </button>
            ) : (
              <p className="text-xs text-center text-text-secondary">
                Change all {delegation.platforms.length} passwords above to confirm
              </p>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
