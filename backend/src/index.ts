import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'

import authRoutes from './routes/auth.js'
import vaultRoutes from './routes/vault.js'
import threatsRoutes from './routes/threats.js'
import scannerRoutes from './routes/scanner.js'
import recoveryRoutes from './routes/recovery.js'
import aiRoutes from './routes/ai.js'
import billingRoutes from './routes/billing.js'
import userRoutes from './routes/user.js'
import monitoringRoutes from './routes/monitoring.js'
import impersonationRoutes from './routes/impersonation.js'
import accessDelegationRoutes from './routes/accessDelegation.js'
import { startExpiryWorker } from './services/delegationExpiry.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))

app.use('/api/billing/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

app.use('/api/auth', authRoutes)
app.use('/api/vault', vaultRoutes)
app.use('/api/threats', threatsRoutes)
app.use('/api/scanner', scannerRoutes)
app.use('/api/recovery', recoveryRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/user', userRoutes)
app.use('/api/monitoring', monitoringRoutes)
app.use('/api/impersonation', impersonationRoutes)
app.use('/api/access', accessDelegationRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'aeforyn-api' }))

app.listen(env.PORT, () => {
  console.log(`AEFORYN API running on port ${env.PORT}`)
  startExpiryWorker()
})

export default app
