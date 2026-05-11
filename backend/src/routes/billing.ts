import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'

const router = Router()
const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

const PRICE_IDS: Record<string, string> = {
  standard_monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY || 'price_standard_monthly',
  standard_annual: process.env.STRIPE_PRICE_STANDARD_ANNUAL || 'price_standard_annual',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
}

router.post('/create-checkout', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan, billing_period } = req.body
  const priceKey = `${plan}_${billing_period || 'monthly'}`
  const priceId = PRICE_IDS[priceKey]

  if (!priceId) { res.status(400).json({ error: 'Invalid plan' }); return }

  const { data: user } = await supabase.from('users').select('stripe_customer_id, email').eq('id', req.userId!).single()

  let customerId = user?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user?.email, metadata: { user_id: req.userId! } })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', req.userId!)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${env.FRONTEND_URL}/billing?success=true`,
    cancel_url: `${env.FRONTEND_URL}/billing?cancelled=true`,
    metadata: { user_id: req.userId! },
  })

  res.json({ url: session.url })
})

router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    res.status(400).json({ error: 'Webhook signature invalid' })
    return
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const { data: user } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).single()
    if (user) {
      const priceId = subscription.items.data[0]?.price.id
      const planMap: Record<string, string> = {
        [PRICE_IDS.standard_monthly]: 'standard',
        [PRICE_IDS.standard_annual]: 'standard',
        [PRICE_IDS.pro_monthly]: 'pro',
        [PRICE_IDS.pro_annual]: 'pro',
      }
      const planTier = planMap[priceId] || 'free'
      await supabase.from('users').update({ plan_tier: planTier }).eq('id', user.id)
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_subscription_id: subscription.id,
        plan_tier: planTier,
        status: subscription.status,
        current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const { data: user } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).single()
    if (user) {
      await supabase.from('users').update({ plan_tier: 'free' }).eq('id', user.id)
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', subscription.id)
    }
  }

  res.json({ received: true })
})

router.get('/portal', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: user } = await supabase.from('users').select('stripe_customer_id').eq('id', req.userId!).single()
  if (!user?.stripe_customer_id) { res.status(400).json({ error: 'No billing account found' }); return }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${env.FRONTEND_URL}/billing`,
  })
  res.json({ url: session.url })
})

router.get('/subscription', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', req.userId!).eq('status', 'active').single()
  res.json(data || null)
})

export default router
