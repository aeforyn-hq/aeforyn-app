import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ExternalLink, Palette, Shield, Brain, Lock, Globe, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { cn } from '@/lib/utils'

type Currency = 'USD' | 'ZAR'

interface Plan {
  id: 'free' | 'standard' | 'pro'
  name: string
  usdPrice: number
  zarPrice: number
  description: string
  highlights: string[]
  badge?: string
  mostPopular?: boolean
  isGold?: boolean
  cta: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    usdPrice: 0,
    zarPrice: 0,
    description: 'Try AEFORYN — basic protection for new creators',
    highlights: ['3 platforms monitored', 'Basic threat alerts', '5 phishing scans/month', '1 GB vault storage'],
    cta: 'Get Started Free',
  },
  {
    id: 'standard',
    name: 'Standard',
    usdPrice: 29,
    zarPrice: 529,
    description: 'Solo creators and freelancers levelling up',
    highlights: ['10 platforms monitored', 'Advanced threat alerts', '50 phishing scans/month', '25 GB vault storage', 'Recovery playbooks', 'Impersonation monitoring + email alerts'],
    cta: 'Upgrade to Standard',
  },
  {
    id: 'pro',
    name: 'Pro',
    usdPrice: 49,
    zarPrice: 899,
    description: 'Full-time creators who depend on their brand',
    highlights: ['Unlimited platforms', 'Real-time threat alerts', 'Unlimited phishing scans', '100 GB vault storage', 'AI assistant + resolution guide', 'Recovery playbooks', 'Priority support', 'Full impersonation detection + takedown tools'],
    badge: 'Most Popular',
    mostPopular: true,
    isGold: true,
    cta: 'Upgrade to Pro',
  },
]

type FeatureValue = string | boolean

interface FeatureRow {
  label: string
  free: FeatureValue
  standard: FeatureValue
  pro: FeatureValue
}

const FEATURE_TABLE: FeatureRow[] = [
  { label: 'Platforms monitored', free: '3', standard: '10', pro: 'Unlimited' },
  { label: 'Threat alerts', free: 'Basic', standard: 'Advanced', pro: 'Real-time' },
  { label: 'Phishing scanner', free: '5/month', standard: '50/month', pro: 'Unlimited' },
  { label: 'Vault storage', free: '1 GB', standard: '25 GB', pro: '100 GB' },
  { label: 'AI assistant', free: false, standard: false, pro: true },
  { label: 'AI resolution guide', free: false, standard: false, pro: true },
  { label: 'Recovery playbooks', free: false, standard: true, pro: true },
  { label: 'Priority support', free: false, standard: false, pro: true },
  { label: 'Account impersonation detection', free: false, standard: 'Monitor only', pro: 'Full detection' },
]

const DIFFERENTIATORS = [
  {
    icon: Palette,
    title: 'Built for creators, not enterprises',
    body: 'Most security tools are designed for IT teams. AEFORYN speaks your language — no jargon, no bloat, no enterprise sales calls.',
  },
  {
    icon: Brain,
    title: 'AI that understands social media threats',
    body: 'Trained on creator-specific attack patterns: fake brand deals, impersonation, account hijacking, and fraudulent DMCA takedowns.',
  },
  {
    icon: Lock,
    title: 'Vault-first privacy',
    body: 'Your content is encrypted at rest with keys only you control. We can\'t read it. No one can.',
  },
  {
    icon: Globe,
    title: 'Dual jurisdiction compliance',
    body: 'POPIA (South Africa) + GDPR (EU/EEA) compliance built in from day one — not bolted on after the fact.',
  },
]

const BILLING_HISTORY = [
  { id: 'inv_001', date: '2024-11-01', plan: 'Pro', amount: '$49.00', status: 'paid' },
  { id: 'inv_002', date: '2024-10-01', plan: 'Pro', amount: '$49.00', status: 'paid' },
  { id: 'inv_003', date: '2024-09-01', plan: 'Standard', amount: '$29.00', status: 'paid' },
]

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return <Check className="w-4 h-4 mx-auto" style={{ color: '#2DD4BF' }} />
  }
  if (value === false) {
    return <span className="block text-center text-sm" style={{ color: 'rgba(134,239,172,0.25)' }}>—</span>
  }
  return <span className="block text-center text-sm" style={{ color: '#F0FDF4' }}>{value}</span>
}

export default function Billing() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const { user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if ((location.state as { openWhyAeforyn?: boolean } | null)?.openWhyAeforyn) {
      setWhyOpen(true)
      setTimeout(() => {
        document.getElementById('why-aeforyn')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [location.state])

  const currentPlan = user?.plan_tier || 'free'

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return
    setUpgrading(planId)
    try {
      const { data } = await api.post('/api/billing/create-checkout', {
        plan: planId,
        billing_period: 'monthly',
      })
      window.location.href = data.url
    } catch {
      toast.error('Failed to start checkout', 'Try again or contact support.')
      setUpgrading(null)
    }
  }

  const handlePaystack = (plan: 'standard' | 'pro') => {
    void plan
    toast.info('Paystack coming soon', 'ZAR billing via Paystack will be available soon.')
  }

  const handleManageBilling = async () => {
    try {
      const { data } = await api.get('/api/billing/portal')
      window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal')
    }
  }

  const formatPrice = (plan: Plan) => {
    if (currency === 'USD') {
      return plan.usdPrice === 0 ? '$0' : `$${plan.usdPrice}`
    }
    return plan.zarPrice === 0 ? 'R0' : `R${plan.zarPrice}`
  }

  return (
    <div
      className="space-y-14 max-w-5xl mx-auto"
      style={{ '--bg-page': '#071E1C', '--bg-card': '#0A2422', '--border-gold': 'rgba(201,168,76,0.15)', '--gold': '#C9A84C', '--teal': '#2DD4BF' } as React.CSSProperties}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '48px',
            letterSpacing: '-1px',
            color: '#F0FDF4',
          }}
        >
          Simple, transparent pricing
        </h1>
        <p className="text-text-secondary text-lg mt-3">
          No hidden fees. Cancel anytime. Upgrade or downgrade in seconds.
        </p>
      </motion.div>

      {/* Pricing section */}
      <div>
        {/* Currency toggle */}
        <div className="flex items-center justify-end mb-6">
          <div
            className="flex items-center rounded-full p-1 gap-1"
            style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            {(['USD', 'ZAR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={
                  currency === c
                    ? { background: '#C9A84C', color: '#071E1C' }
                    : { color: 'rgba(201,168,76,0.6)', background: 'transparent' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === currentPlan

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col rounded-2xl p-6 transition-all duration-200"
                style={{
                  background: '#0A2422',
                  border: plan.isGold
                    ? '1.5px solid #C9A84C'
                    : isCurrent
                    ? '1.5px solid rgba(201,168,76,0.4)'
                    : '1px solid rgba(201,168,76,0.15)',
                  boxShadow: plan.isGold
                    ? '0 0 12px rgba(201,168,76,0.12), 0 0 40px rgba(201,168,76,0.06)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!plan.isGold) {
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(201,168,76,0.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.isGold) {
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }
                }}
              >
                {/* Gold top line for Pro */}
                {plan.isGold && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
                  />
                )}

                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '20px',
                      color: '#F0FDF4',
                    }}
                  >
                    {plan.name}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    {plan.badge && <Badge variant="gold">{plan.badge}</Badge>}
                    {isCurrent && <Badge variant="teal">Current Plan</Badge>}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        fontSize: '40px',
                        color: '#C9A84C',
                        lineHeight: 1,
                      }}
                    >
                      {formatPrice(plan)}
                    </span>
                    {plan.usdPrice > 0 && (
                      <span className="text-text-secondary text-sm">/mo</span>
                    )}
                  </div>
                  {plan.usdPrice === 0 && (
                    <p className="text-xs text-text-secondary mt-1">Forever free</p>
                  )}
                  <p className="text-xs text-text-secondary mt-2">{plan.description}</p>
                </div>

                {/* Highlights */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2DD4BF' }} />
                      <span className="text-sm text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold cursor-default"
                    style={{
                      background: 'rgba(201,168,76,0.08)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: '#C9A84C',
                    }}
                  >
                    ✓ Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold cursor-default opacity-50"
                    style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
                  >
                    {plan.cta}
                  </button>
                ) : currency === 'ZAR' ? (
                  <button
                    onClick={() => handlePaystack(plan.id as 'standard' | 'pro')}
                    className={cn('w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200', 'btn-primary')}
                  >
                    Pay with Paystack
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className={cn('w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200', 'btn-primary')}
                  >
                    {upgrading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Loading…
                      </span>
                    ) : (
                      `Pay with Stripe`
                    )}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Why Aeforyn? accordion */}
      <motion.div
        id="why-aeforyn"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <button
          onClick={() => setWhyOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/3"
        >
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#C9A84C' }}>
            Why Aeforyn?
          </span>
          <motion.div animate={{ rotate: whyOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-5 h-5 text-gold" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {whyOpen && (
            <motion.div
              key="why-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-5" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                {DIFFERENTIATORS.map((d, i) => {
                  const Icon = d.icon
                  return (
                    <motion.div
                      key={d.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 mt-5"
                      style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 12px rgba(245,158,11,0.15)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#C9A84C' }} />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F0FDF4', marginBottom: '6px' }}>
                          {d.title}
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{d.body}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Impersonation detection callout — prominent, above feature table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(245,158,11,0.05)',
          border: '2px solid #F59E0B',
          boxShadow: '0 0 24px rgba(245,158,11,0.18), inset 0 0 20px rgba(245,158,11,0.04)',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)' }}
          >
            <Shield className="w-5 h-5" style={{ color: '#F59E0B' }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F0FDF4', marginBottom: '8px' }}>
              Account Impersonation Detection
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              AEFORYN monitors for copycat accounts using your handle, avatar, and bio.
            </p>
            <div className="flex items-center gap-3 mb-4">
              {['instagram', 'tiktok', 'youtube', 'x', 'facebook', 'linkedin'].map((p) => (
                <div
                  key={p}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
                  title={p}
                >
                  <PlatformIcon platform={p} size={15} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>Standard — Monitoring Only</p>
                <ul className="text-xs text-text-secondary space-y-0.5">
                  <li>• Cross-platform handle monitoring</li>
                  <li>• Email notifications on detection</li>
                </ul>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>Pro — Full Detection</p>
                <ul className="text-xs text-text-secondary space-y-0.5">
                  <li>• AI risk analysis + takedown guide</li>
                  <li>• Fake account tracker</li>
                  <li>• Brand deal phishing scanner</li>
                  <li>• Real-time alert overlay + monthly report</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full feature comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="px-6 pt-6 pb-4">
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '22px',
              color: '#F0FDF4',
            }}
          >
            Full feature comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px', width: '40%' }}>
                  Feature
                </th>
                {PLANS.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center" style={{ width: '20%' }}>
                    <span
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: p.isGold ? '#C9A84C' : '#F0FDF4',
                      }}
                    >
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_TABLE.map((row, idx) => (
                <tr
                  key={row.label}
                  style={{
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    borderBottom: idx < FEATURE_TABLE.length - 1 ? '1px solid rgba(201,168,76,0.06)' : 'none',
                  }}
                >
                  <td className="px-6 py-3.5 text-text-secondary">
                    <span className="flex items-center gap-2">
                      {row.label === 'Account impersonation detection' && (
                        <span className="flex items-center gap-1">
                          {['instagram','tiktok','youtube','x','facebook'].map((p) => (
                            <PlatformIcon key={p} platform={p} size={12} />
                          ))}
                        </span>
                      )}
                      {row.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><FeatureCell value={row.free} /></td>
                  <td className="px-4 py-3.5"><FeatureCell value={row.standard} /></td>
                  <td className="px-4 py-3.5"><FeatureCell value={row.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* White Label banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(10,36,34,0.8))', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <Palette className="w-7 h-7 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0FDF4' }}>
                White Label
              </h3>
              <Badge variant="gold">Custom Pricing</Badge>
            </div>
            <p className="text-text-secondary text-sm max-w-lg">
              Full AEFORYN platform under your brand. Custom domain, branded onboarding, custom feature development available. Built for agencies and MCNs.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          className="flex-shrink-0 whitespace-nowrap"
          onClick={() => window.open('mailto:hello@aeforyn.com?subject=White Label Enquiry', '_blank')}
        >
          Contact for Pricing
        </Button>
      </motion.div>

      {/* Manage billing */}
      {currentPlan !== 'free' && (
        <div className="card-static">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="heading-card">Billing Management</h3>
              <p className="text-text-secondary text-sm mt-1">
                View invoices, update payment method, or cancel your subscription.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleManageBilling}>
                <ExternalLink className="w-4 h-4" /> Manage Billing
              </Button>
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Billing history */}
      <div className="card-static">
        <h3 className="heading-card mb-6">Billing History</h3>
        {BILLING_HISTORY.length === 0 ? (
          <p className="text-text-secondary text-sm">No billing history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(45,212,191,0.08)' }}>
                  {['Date', 'Plan', 'Amount', 'Status', 'Invoice'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary"
                      style={{ letterSpacing: '1.5px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(45,212,191,0.04)' }}>
                {BILLING_HISTORY.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-4 text-text-primary">{inv.date}</td>
                    <td className="py-4 text-text-secondary">{inv.plan}</td>
                    <td className="py-4 mono-text text-gold">{inv.amount}</td>
                    <td className="py-4">
                      <Badge variant="safe">{inv.status}</Badge>
                    </td>
                    <td className="py-4">
                      <button className="text-teal hover:text-teal-mid text-xs flex items-center gap-1 transition-colors">
                        Download <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Subscription" size="sm">
        <div className="space-y-5">
          <p className="text-text-secondary text-sm leading-relaxed">
            We're sorry to see you go. Your plan will remain active until the end of your current billing period. After that, your account will revert to the Free plan.
          </p>
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <p className="text-sm text-warning-color font-medium mb-1">What you'll lose:</p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Vault storage above 1 GB</li>
              <li>• Platform monitoring beyond 3 platforms</li>
              <li>• AI assistant access</li>
              <li>• Recovery playbooks</li>
              <li>• Impersonation detection</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setCancelOpen(false)}>
              Keep my plan
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleManageBilling}>
              Cancel via Portal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
