import { Router, Response } from 'express'
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'

const router = Router()

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
})

router.get('/export', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const [users, threats, scans, platforms, vault, sessions, conversations] = await Promise.all([
    supabase.from('users').select('*').eq('id', req.userId!).single(),
    supabase.from('threats_log').select('*').eq('user_id', req.userId!),
    supabase.from('scan_results').select('*').eq('user_id', req.userId!),
    supabase.from('platforms_connected').select('*').eq('user_id', req.userId!),
    supabase.from('vault_files').select('*').eq('user_id', req.userId!),
    supabase.from('recovery_sessions').select('*').eq('user_id', req.userId!),
    supabase.from('ai_conversations').select('*').eq('user_id', req.userId!),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user: users.data,
    platforms: platforms.data,
    threats: threats.data,
    scan_results: scans.data,
    vault_files: vault.data,
    recovery_sessions: sessions.data,
    ai_conversations: conversations.data,
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="aeforyn-export-${req.userId}.json"`)
  res.json(exportData)
})

router.delete('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: files } = await supabase.from('vault_files').select('r2_key').eq('user_id', req.userId!)

  if (files?.length) {
    const listing = await r2.send(new ListObjectsV2Command({ Bucket: env.R2_BUCKET_NAME, Prefix: `${req.userId}/` }))
    for (const obj of listing.Contents || []) {
      if (obj.Key) await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: obj.Key }))
    }
  }

  await supabase.auth.admin.deleteUser(req.userId!)
  res.json({ message: 'Account and all data permanently deleted' })
})

router.patch('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { creator_handle } = req.body
  const { data, error } = await supabase
    .from('users')
    .update({ creator_handle, updated_at: new Date().toISOString() })
    .eq('id', req.userId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

export default router
