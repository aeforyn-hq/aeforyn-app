import { Router, Response } from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../db/supabase.js'
import { env } from '../config/env.js'
import { PLAN_LIMITS } from '../config/planLimits.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 * 1024 } })

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

router.get('/files', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { category } = req.query
  let query = supabase.from('vault_files').select('*').eq('user_id', req.userId!).order('uploaded_at', { ascending: false })
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: 'No file provided' }); return }

  const planLimits = PLAN_LIMITS[req.userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

  const { data: user } = await supabase.from('users').select('storage_used_bytes').eq('id', req.userId!).single()
  const currentUsed = user?.storage_used_bytes || 0

  if (currentUsed + req.file.size > planLimits.storage_bytes) {
    res.status(403).json({ error: 'Storage quota exceeded. Upgrade your plan for more storage.' })
    return
  }

  const fileExt = req.file.originalname.split('.').pop()
  const r2Key = `${req.userId}/${uuidv4()}.${fileExt}`
  const category = req.body.category || 'general'

  await r2.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: r2Key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ServerSideEncryption: 'AES256',
  }))

  const { data: file, error } = await supabase.from('vault_files').insert({
    user_id: req.userId!,
    file_name: req.file.originalname,
    file_type: req.file.mimetype,
    file_size_bytes: req.file.size,
    r2_key: r2Key,
    category,
    is_encrypted: true,
  }).select().single()

  if (error) { res.status(500).json({ error: error.message }); return }

  await supabase.from('users').update({ storage_used_bytes: currentUsed + req.file.size }).eq('id', req.userId!)

  res.json(file)
})

router.get('/download/:fileId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: file } = await supabase
    .from('vault_files')
    .select('*')
    .eq('id', req.params.fileId)
    .eq('user_id', req.userId!)
    .single()

  if (!file) { res.status(404).json({ error: 'File not found' }); return }

  const url = await getSignedUrl(r2, new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: file.r2_key }), { expiresIn: 900 })
  res.json({ url, file_name: file.file_name })
})

router.delete('/files/:fileId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: file } = await supabase
    .from('vault_files')
    .select('*')
    .eq('id', req.params.fileId)
    .eq('user_id', req.userId!)
    .single()

  if (!file) { res.status(404).json({ error: 'File not found' }); return }

  await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: file.r2_key }))
  await supabase.from('vault_files').delete().eq('id', file.id)
  await supabase.from('users').update({ storage_used_bytes: supabase.rpc('greatest', { a: 0, b: -file.file_size_bytes }) }).eq('id', req.userId!)

  res.json({ message: 'File deleted' })
})

export default router
