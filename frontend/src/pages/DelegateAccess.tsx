import { useState, useEffect } from 'react'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { Shield, Clock, Eye, Copy, CheckCircle, AlertTriangle, Lock, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'invalid' | 'valid_unconfirmed' | 'confirmed' | 'error'

type CardState = 'idle' | 'loading' | 'revealed' | 'already_revealed'

interface DelegationData {
  delegationId: string
  delegateName: string
  ownerName: string
  platforms: string[]
  vaultItemIds: string[]
  expiresAt: string
}

interface CredentialCard {
  vaultItemId: string
  platform: string
  state: CardState
  value?: string
  revealedAt?: string
  alreadyRevealedAt?: string
}

// ─── Platform icon helper ─────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'E1306C',
  tiktok: '69C9D0',
  youtube: 'FF0000',
  x: 'FFFFFF',
  facebook: '1877F2',
  linkedin: '0A66C2',
  discord: '5865F2',
  twitch: '9146FF',
  patreon: 'FF424D',
}

function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] ?? '86EFAC'
}

function PlatformIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const slug = platform.toLowerCase()
  const color = getPlatformColor(platform)
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color}`}
      alt={platform}
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0 }}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement
        target.style.display = 'none'
      }}
    />
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function CountdownTimer({ expiresAt, ownerName }: { expiresAt: string; ownerName: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('EXPIRED'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setUrgent(diff < 30 * 60 * 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: urgent ? '#EF4444' : '#2DD4BF' }}>
      Session expires in {timeLeft}
    </span>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(201,168,76,0.15)',
          borderTopColor: '#C9A84C',
        }}
      />
      <p style={{ color: '#86EFAC', fontSize: '14px', fontFamily: 'JetBrains Mono' }}>
        Verifying access link…
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DelegateAccess() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [delegation, setDelegation] = useState<DelegationData | null>(null)
  const [cards, setCards] = useState<CredentialCard[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const token = new URLSearchParams(window.location.search).get('token')

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setPageState('invalid')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/access/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          setPageState('invalid')
          return
        }

        const data: DelegationData = await res.json()

        if (!data.delegationId) {
          setPageState('invalid')
          return
        }

        setDelegation(data)

        // Build initial card state — one card per vaultItemId
        const initialCards: CredentialCard[] = data.vaultItemIds.map((id, idx) => ({
          vaultItemId: id,
          platform: data.platforms[idx] ?? data.platforms[0] ?? 'Unknown',
          state: 'idle',
        }))
        setCards(initialCards)
        setPageState('valid_unconfirmed')
      } catch {
        setPageState('error')
      }
    }

    verify()
  }, [token])

  // Reveal a single credential
  const handleReveal = async (vaultItemId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.vaultItemId === vaultItemId ? { ...c, state: 'loading' } : c))
    )

    try {
      const res = await fetch(`${API_URL}/api/access/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, vault_item_id: vaultItemId }),
      })

      const data = await res.json()

      if (res.ok) {
        setCards((prev) =>
          prev.map((c) =>
            c.vaultItemId === vaultItemId
              ? { ...c, state: 'revealed', value: data.value, revealedAt: new Date().toLocaleTimeString() }
              : c
          )
        )
      } else if (data.code === 'already_revealed' || res.status === 409) {
        setCards((prev) =>
          prev.map((c) =>
            c.vaultItemId === vaultItemId
              ? { ...c, state: 'already_revealed', alreadyRevealedAt: data.revealedAt ?? 'an earlier time' }
              : c
          )
        )
      } else {
        setCards((prev) =>
          prev.map((c) => (c.vaultItemId === vaultItemId ? { ...c, state: 'idle' } : c))
        )
      }
    } catch {
      setCards((prev) =>
        prev.map((c) => (c.vaultItemId === vaultItemId ? { ...c, state: 'idle' } : c))
      )
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // ── Shared wrapper ──────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#071E1C' }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <AeforynLogo size="md" showWordmark />
        </div>

        <AnimatePresence mode="wait">
          {/* ── LOADING ──────────────────────────────────────────────────────── */}
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {/* ── INVALID ──────────────────────────────────────────────────────── */}
          {pageState === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#0A2422',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: '16px',
                padding: '48px 36px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(201,168,76,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Lock size={36} style={{ color: '#C9A84C' }} />
              </div>
              <h1
                style={{
                  color: '#F0FDF4',
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                This access link is invalid or has expired.
              </h1>
              <p style={{ color: '#86EFAC', fontSize: '14px', lineHeight: 1.6 }}>
                Contact the account owner for a new link.
              </p>
            </motion.div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────────── */}
          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#0A2422',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '16px',
                padding: '48px 36px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <AlertTriangle size={36} style={{ color: '#EF4444' }} />
              </div>
              <h1
                style={{
                  color: '#F0FDF4',
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                Something went wrong.
              </h1>
              <p style={{ color: '#86EFAC', fontSize: '14px', lineHeight: 1.6 }}>
                Please try again or contact the account owner.
              </p>
            </motion.div>
          )}

          {/* ── VALID UNCONFIRMED ─────────────────────────────────────────────── */}
          {pageState === 'valid_unconfirmed' && delegation && (
            <motion.div
              key="unconfirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#0A2422',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: '16px',
                padding: '36px',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <Shield size={22} style={{ color: '#C9A84C', flexShrink: 0 }} />
                <h1
                  style={{
                    color: '#F0FDF4',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  You have been granted temporary access by{' '}
                  <span style={{ color: '#C9A84C' }}>{delegation.ownerName}</span>
                </h1>
              </div>

              {/* Countdown */}
              <div className="mb-6 mt-3">
                <CountdownTimer expiresAt={delegation.expiresAt} ownerName={delegation.ownerName} />
              </div>

              {/* Platforms */}
              <p
                style={{
                  color: '#86EFAC',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Which platform credentials you can access:
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                {delegation.platforms.map((platform, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(45,212,191,0.04)',
                      border: '1px solid rgba(45,212,191,0.12)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                    }}
                  >
                    <PlatformIcon platform={platform} size={18} />
                    <span
                      style={{
                        color: '#F0FDF4',
                        fontSize: '14px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {platform}
                    </span>
                  </div>
                ))}
              </div>

              {/* Disclaimer box */}
              <div
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '28px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle
                  size={18}
                  style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }}
                />
                <p style={{ color: '#F59E0B', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  This is a one-time secure reveal. Each password can only be shown once. All
                  activity in this session is logged and visible to{' '}
                  <strong>{delegation.ownerName}</strong>.
                </p>
              </div>

              {/* Confirm button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPageState('confirmed')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #C9A84C, #9A7A35)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#071E1C',
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                I understand — show me the credentials
              </motion.button>
            </motion.div>
          )}

          {/* ── CONFIRMED ────────────────────────────────────────────────────── */}
          {pageState === 'confirmed' && delegation && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Heading row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield size={20} style={{ color: '#C9A84C' }} />
                  <h1
                    style={{
                      color: '#F0FDF4',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    Secure Credentials
                  </h1>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-6">
                <CountdownTimer expiresAt={delegation.expiresAt} ownerName={delegation.ownerName} />
              </div>

              {/* Credential cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {cards.map((card) => (
                  <motion.div
                    key={card.vaultItemId}
                    layout
                    style={{
                      background: '#0A2422',
                      border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: '14px',
                      padding: '20px',
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-4">
                      <PlatformIcon platform={card.platform} size={22} />
                      <span
                        style={{
                          color: '#F0FDF4',
                          fontSize: '16px',
                          fontWeight: 600,
                          fontFamily: 'Space Grotesk, sans-serif',
                          textTransform: 'capitalize',
                        }}
                      >
                        {card.platform}
                      </span>
                    </div>

                    {/* Card body — state-dependent */}
                    <AnimatePresence mode="wait">
                      {card.state === 'idle' && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleReveal(card.vaultItemId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 18px',
                              background: 'linear-gradient(135deg, #C9A84C, #9A7A35)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#071E1C',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={16} />
                            Reveal Credential
                          </motion.button>
                        </motion.div>
                      )}

                      {card.state === 'loading' && (
                        <motion.div
                          key="loading-card"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: '2px solid rgba(201,168,76,0.2)',
                              borderTopColor: '#C9A84C',
                            }}
                          />
                          <span style={{ color: '#86EFAC', fontSize: '13px' }}>Fetching credential…</span>
                        </motion.div>
                      )}

                      {card.state === 'revealed' && (
                        <motion.div
                          key="revealed"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {/* Revealed badge */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '12px',
                            }}
                          >
                            <CheckCircle size={15} style={{ color: '#22C55E' }} />
                            <span
                              style={{
                                color: '#22C55E',
                                fontSize: '13px',
                                fontFamily: 'JetBrains Mono',
                              }}
                            >
                              Revealed at {card.revealedAt}
                            </span>
                          </div>

                          {/* Credential value */}
                          <div
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(45,212,191,0.2)',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              marginBottom: '12px',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'JetBrains Mono',
                                fontSize: '14px',
                                color: '#2DD4BF',
                                wordBreak: 'break-all',
                                flex: 1,
                              }}
                            >
                              {card.value}
                            </span>
                            <button
                              onClick={() => handleCopy(card.value ?? '', card.vaultItemId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: copied === card.vaultItemId ? '#22C55E' : '#86EFAC',
                                flexShrink: 0,
                              }}
                              title="Copy to clipboard"
                            >
                              {copied === card.vaultItemId ? (
                                <CheckCircle size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>

                          {/* Warning */}
                          <div
                            style={{
                              background: 'rgba(239,68,68,0.06)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: '7px',
                              padding: '10px 12px',
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'flex-start',
                            }}
                          >
                            <AlertTriangle
                              size={14}
                              style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }}
                            />
                            <p
                              style={{
                                color: '#EF4444',
                                fontSize: '12px',
                                lineHeight: 1.5,
                                margin: 0,
                              }}
                            >
                              Do not save this credential anywhere. It stops working after{' '}
                              {new Date(delegation.expiresAt).toLocaleString()}.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {card.state === 'already_revealed' && (
                        <motion.div
                          key="already_revealed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            background: 'rgba(245,158,11,0.06)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Clock
                            size={15}
                            style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }}
                          />
                          <p style={{ color: '#F59E0B', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                            This credential was already revealed at{' '}
                            <strong>{card.alreadyRevealedAt}</strong>.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Bottom warning banner */}
              <div
                style={{
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Shield size={16} style={{ color: '#C9A84C', flexShrink: 0 }} />
                <p style={{ color: '#C9A84C', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  All activity in this session is logged and timestamped.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
