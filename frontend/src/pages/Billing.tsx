import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, Palette, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { cn } from '@/lib/utils'

type BillingPeriod = 'monthly' | 'annual'

interface Plan {
  id: string
  name: string
  monthlyPrice: number | null
  annualPrice: number | null
  description: string
  features: string[]
  badge?: string
  highlight?: boolean
  cta: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Try AEFORYN — basic protection',
    features: ['2GB encrypted vault', '1 platform monitored', '5 phishing scans/month', 'Basic breach alerts'],
    cta: 'Current Plan',
  },
  {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 29,
    annualPrice: 24,
    description: 'Solo creators and freelancers',
    features: ['10GB encrypted vault', '5 platforms monitored', '50 phishing scans/month', 'AI security assistant', 'Threat monitoring', 'Breach alerts'],
    badge: 'Most Popular',
    cta: 'Upgrade to Standard',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 49,
    annualPrice: 41,
    description: 'Full-time creators earning from content',
    features: ['50GB encrypted vault', 'Unlimited platforms', 'Unlimited phishing scans', 'Recovery playbooks', 'Anomaly detection', 'Access manager', 'Priority support', 'AI security assistant'],
    badge: 'Best Value',
    highlight: true,
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'Agencies, MCNs, white-label',
    features: ['Everything in Pro', '20+ creator accounts', 'Multi-creator dashboard', 'Dedicated onboarding', 'SLA guarantee', 'Custom domain option', 'Priority 1-on-1 support'],
    cta: 'Contact Us',
  },
]

const BILLING_HISTORY = [
  { id: 'inv_001', date: '2024-11-01', plan: 'Pro', amount: '$49.00', status: 'paid' },
  { id: 'inv_002', date: '2024-10-01', plan: 'Pro', amount: '$49.00', status: 'paid' },
  { id: 'inv_003', date: '2024-09-01', plan: 'Standard', amount: '$29.00', status: 'paid' },
]

export default function Billing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const { user } = useAuthStore()

  const currentPlan = user?.plan_tier || 'free'

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.open('mailto:hello@aeforyn.com?subject=Enterprise Plan Enquiry', '_blank')
      return
    }
    if (planId === currentPlan) return
    setUpgrading(planId)
    try {
      const { data } = await api.post('/api/billing/create-checkout', {
        plan: planId,
        billing_period: billingPeriod,
      })
      window.location.href = data.url
    } catch {
      toast.error('Failed to start checkout', 'Try again or contact support.')
      setUpgrading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const { data } = await api.get('/api/billing/portal')
      window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal')
    }
  }

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === null) return null
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', letterSpacing: '-1px', color: '#F0FDF4' }}>
          Simple, transparent pricing
        </h1>
        <p className="text-text-secondary text-lg mt-3">No hidden fees. Cancel anytime. Upgrade or downgrade in seconds.</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className="text-sm font-medium transition-colors"
            style={{ color: billingPeriod === 'monthly' ? '#F0FDF4' : '#86EFAC' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <span
              className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
              style={{ background: '#C9A84C', left: billingPeriod === 'annual' ? '33px' : '3px' }}
            />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBillingPeriod('annual')}
              className="text-sm font-medium transition-colors"
              style={{ color: billingPeriod === 'annual' ? '#F0FDF4' : '#86EFAC' }}
            >
              Annual
            </button>
            <span className="badge-gold text-[10px]">Save 17%</span>
          </div>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan, i) => {
          const price = getPrice(plan)
          const isCurrent = plan.id === currentPlan
          const isHighlight = plan.highlight

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col rounded-2xl p-6 transition-all duration-200"
              style={{
                background: isCurrent ? 'rgba(201,168,76,0.06)' : '#0C1A0F',
                border: isCurrent ? '2px solid rgba(201,168,76,0.5)' : isHighlight ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(45,212,191,0.1)',
                boxShadow: isHighlight ? '0 0 40px rgba(201,168,76,0.08)' : 'none',
              }}
            >
              {/* Gold top border for Pro */}
              {isHighlight && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
              )}

              {/* Badges */}
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F0FDF4' }}>
                  {plan.name}
                </span>
                <div className="flex flex-col items-end gap-1">
                  {plan.badge && <Badge variant="gold">{plan.badge}</Badge>}
                  {isCurrent && <Badge variant="teal">Current</Badge>}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                {price !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '40px', color: '#C9A84C', lineHeight: 1 }}>
                        ${price}
                      </span>
                      <span className="text-text-secondary text-sm">/month</span>
                    </div>
                    {billingPeriod === 'annual' && plan.monthlyPrice && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-text-secondary mt-1">
                        <span style={{ textDecoration: 'line-through', color: 'rgba(134,239,172,0.4)' }}>${plan.monthlyPrice}/mo</span>
                        {' '} billed ${(plan.annualPrice! * 12)} annually
                      </p>
                    )}
                    {price === 0 && <p className="text-xs text-text-secondary mt-1">Forever free</p>}
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#C9A84C' }}>
                      Custom
                    </span>
                  </div>
                )}
                <p className="text-xs text-text-secondary mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || upgrading === plan.id}
                className={cn(
                  'w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
                  isCurrent
                    ? 'cursor-default opacity-60'
                    : plan.id === 'enterprise'
                    ? 'btn-ghost'
                    : 'btn-primary'
                )}
                style={isCurrent ? { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' } : undefined}
              >
                {upgrading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : isCurrent ? '✓ Current Plan' : plan.cta}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* White Label banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(12,26,15,0.8))', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Palette className="w-7 h-7 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0FDF4' }}>White Label</h3>
              <Badge variant="gold">Custom Pricing</Badge>
            </div>
            <p className="text-text-secondary text-sm max-w-lg">
              Full AEFORYN platform under your brand. Custom domain, branded onboarding, custom feature development available. Built for agencies and MCNs.
            </p>
          </div>
        </div>
        <Button variant="primary" className="flex-shrink-0 whitespace-nowrap" onClick={() => window.open('mailto:hello@aeforyn.com?subject=White Label Enquiry', '_blank')}>
          Contact for Pricing
        </Button>
      </motion.div>

      {/* Manage billing */}
      {currentPlan !== 'free' && (
        <div className="card-static">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="heading-card">Billing Management</h3>
              <p className="text-text-secondary text-sm mt-1">View invoices, update payment method, or cancel your subscription.</p>
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
                    <th key={h} className="text-left pb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary" style={{ letterSpacing: '1.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(45,212,191,0.04)' }}>
                {BILLING_HISTORY.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-4 text-text-primary">{inv.date}</td>
                    <td className="py-4 text-text-secondary">{inv.plan}</td>
                    <td className="py-4 mono-text text-gold">{inv.amount}</td>
                    <td className="py-4"><Badge variant="safe">{inv.status}</Badge></td>
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
          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-sm text-warning-color font-medium mb-1">What you'll lose:</p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Vault storage above 2GB</li>
              <li>• Platform monitoring beyond 1 platform</li>
              <li>• AI assistant access</li>
              <li>• Recovery playbooks</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setCancelOpen(false)}>Keep my plan</Button>
            <Button variant="danger" className="flex-1" onClick={handleManageBilling}>Cancel via Portal</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
