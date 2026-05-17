// Demo data for when API is not connected
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { HardDrive, Upload, Download, Trash2, Lock, FileVideo, FileImage, FileText, Key, File, ShieldCheck, ChevronDown } from 'lucide-react'
import { hasFeature } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'
import { formatBytes, timeAgo, cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import type { VaultFile } from '@/types'

const STORAGE_LIMITS: Record<string, number> = {
  free: 2147483648, standard: 10737418240, pro: 53687091200, enterprise: 214748364800,
}

const DEMO_FILES: VaultFile[] = [
  { id: '1', user_id: 'demo', file_name: 'Q4_Brand_Deal_Contract.pdf', file_type: 'application/pdf', file_size_bytes: 2400000, r2_key: '1', category: 'document', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
  { id: '2', user_id: 'demo', file_name: 'YouTube_Analytics_Nov2024.mp4', file_type: 'video/mp4', file_size_bytes: 450000000, r2_key: '2', category: 'video', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: '3', user_id: 'demo', file_name: 'Backup_Codes_Instagram.pdf', file_type: 'application/pdf', file_size_bytes: 180000, r2_key: '3', category: 'credential', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*48).toISOString() },
  { id: '4', user_id: 'demo', file_name: 'TikTok_Campaign_Dec.mp4', file_type: 'video/mp4', file_size_bytes: 280000000, r2_key: '4', category: 'video', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*72).toISOString() },
  { id: '5', user_id: 'demo', file_name: 'Profile_Photo_HD.jpg', file_type: 'image/jpeg', file_size_bytes: 4500000, r2_key: '5', category: 'image', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*96).toISOString() },
  { id: '6', user_id: 'demo', file_name: 'Sponsor_Agreement_2024.pdf', file_type: 'application/pdf', file_size_bytes: 1800000, r2_key: '6', category: 'document', is_encrypted: true, uploaded_at: new Date(Date.now() - 1000*60*60*120).toISOString() },
]

const CATEGORIES = ['all', 'video', 'image', 'document', 'credential', 'other'] as const
type Category = typeof CATEGORIES[number]

const FILE_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  video: FileVideo,
  image: FileImage,
  document: FileText,
  credential: Key,
  other: File,
  general: File,
}

const CATEGORY_COLORS: Record<string, string> = {
  video: '#2DD4BF', image: '#C9A84C', document: '#86EFAC', credential: '#F59E0B', other: '#9CA3AF', general: '#9CA3AF',
}

// ---------------------------------------------------------------------------
// Proof of Ownership Package — Section 11
// ---------------------------------------------------------------------------

const POO_CATEGORIES = [
  {
    id: 'platform_ownership',
    label: 'Platform Ownership',
    description: 'Screenshots showing you are the original account creator — profile creation date, original email confirmation, admin dashboard.',
    examples: ['Account creation email', 'Original profile screenshots', 'Admin/Creator Studio screenshots'],
    icon: ShieldCheck,
  },
  {
    id: 'content_proof',
    label: 'Content Proof',
    description: 'Evidence that the content is yours — watermarked originals, raw files, early drafts, posting timestamps.',
    examples: ['Original video files / RAW images', 'Canva or editing project exports', 'Scheduled post confirmations'],
    icon: FileText,
  },
  {
    id: 'brand_identity',
    label: 'Brand Identity',
    description: 'Proof of your brand: logo files, trademark registration, brand kit, signed contracts.',
    examples: ['Logo source files (AI, SVG, PSD)', 'Trademark/registration documents', 'Brand usage agreements'],
    icon: Key,
  },
  {
    id: 'identity_documents',
    label: 'Identity Documents',
    description: 'Link your real identity to your creator accounts — ID, selfie with ID, notarised ownership letters.',
    examples: ['Government-issued ID (redacted)', 'Selfie holding ID + account username', 'Notarised ownership letter'],
    icon: File,
  },
]

function ProofOfOwnership() {
  const { user } = useAuthStore()
  const isPro = hasFeature(user?.plan_tier || 'free', 'proof_of_ownership')
  const isStandard = hasFeature(user?.plan_tier || 'free', 'vault_upload')
  const [open, setOpen] = useState(false)
  const [uploadingCat, setUploadingCat] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const queryClient = useQueryClient()

  const handleProofUpload = async (categoryId: string, file: File) => {
    setUploadingCat(categoryId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'document')
      formData.append('proof_category', categoryId)
      formData.append('vault_path', `proof-of-ownership/${user?.id}/${categoryId}/`)
      await api.post('/api/vault/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      queryClient.invalidateQueries({ queryKey: ['vault-files'] })
      toast.success(`${file.name} uploaded to ${categoryId.replace(/_/g, ' ')}`)
    } catch {
      toast.error('Upload failed — try again')
    } finally {
      setUploadingCat(null)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(45,212,191,0.15)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 transition-colors hover:bg-white/3"
        style={{ background: 'rgba(45,212,191,0.03)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
            <ShieldCheck className="w-5 h-5 text-teal" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-text-primary">Proof of Ownership Package</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: isPro ? 'rgba(45,212,191,0.15)' : 'rgba(201,168,76,0.15)', color: isPro ? '#2DD4BF' : '#C9A84C', border: `1px solid ${isPro ? 'rgba(45,212,191,0.3)' : 'rgba(201,168,76,0.3)'}` }}>
                {isPro ? 'Pro' : 'Pro only'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">Upload ownership docs for all your platforms — your legal protection if accounts are stolen.</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 pt-0 space-y-4" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>

              {!isPro ? (
                <div className="py-6 text-center">
                  {isStandard ? (
                    <>
                      <Lock className="w-10 h-10 text-gold mx-auto mb-3" />
                      <p className="text-sm font-semibold text-text-primary mb-1">Proof of Ownership is a Pro feature</p>
                      <p className="text-xs text-text-secondary mb-4 max-w-sm mx-auto">Upload and store legally-admissible ownership documents for every platform you create on. Available from Pro.</p>
                      <Link to="/billing" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}>
                        Upgrade to Pro →
                      </Link>
                    </>
                  ) : (
                    <>
                      <Lock className="w-10 h-10 text-gold mx-auto mb-3" />
                      <p className="text-sm font-semibold text-text-primary mb-1">Available on Standard and above</p>
                      <Link to="/billing" className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A35)', color: '#071E1C' }}>
                        Upgrade →
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)' }}>
                    <p className="text-xs text-teal font-semibold mb-1">Why this matters</p>
                    <p className="text-xs text-text-secondary leading-relaxed">If your account is stolen or wrongfully suspended, platforms require proof you are the original owner. These documents are your legal backup — stored encrypted in your vault and ready when you need them.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {POO_CATEGORIES.map(({ id, label, description, examples, icon: Icon }) => (
                      <div key={id} className="p-4 rounded-xl" style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.1)' }}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(45,212,191,0.1)' }}>
                            <Icon className="w-4 h-4 text-teal" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{label}</p>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {examples.map((ex) => (
                            <span key={ex} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(134,239,172,0.06)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.12)' }}>{ex}</span>
                          ))}
                        </div>
                        <input
                          type="file"
                          ref={(el) => { fileRefs.current[id] = el }}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProofUpload(id, f) }}
                        />
                        <button
                          onClick={() => fileRefs.current[id]?.click()}
                          disabled={uploadingCat === id}
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all hover:opacity-80"
                          style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
                        >
                          {uploadingCat === id ? (
                            <><div className="w-3 h-3 border border-teal border-t-transparent rounded-full animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-3.5 h-3.5" /> Upload to {label}</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Vault() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: files = DEMO_FILES } = useQuery({
    queryKey: ['vault-files', activeCategory],
    queryFn: async () => {
      const { data } = await api.get<VaultFile[]>('/api/vault/files', {
        params: { category: activeCategory === 'all' ? undefined : activeCategory },
      })
      return data
    },
    placeholderData: DEMO_FILES,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/vault/files/${id}`) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vault-files'] }); toast.success('File deleted') },
    onError: () => toast.error('Delete failed', 'Nothing was removed. Try again.'),
  })

  const handleUpload = async (uploadFiles: FileList | null) => {
    if (!uploadFiles?.length) return
    setUploading(true)
    let success = 0
    for (const file of Array.from(uploadFiles)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', getCategory(file.type))
        await api.post('/api/vault/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        success++
      } catch {
        toast.error(`Failed to upload ${file.name}`, 'Upload failed. Nothing was stored. Try again.')
      }
    }
    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['vault-files'] })
      toast.success(`${success} file${success > 1 ? 's' : ''} encrypted & uploaded`)
    }
    setUploading(false)
  }

  const handleDownload = async (file: VaultFile) => {
    try {
      toast.info('Preparing download…', 'Generating secure link.')
      const { data } = await api.get<{ url: string; file_name: string }>(`/api/vault/download/${file.id}`)
      const a = document.createElement('a')
      a.href = data.url
      a.download = data.file_name
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('Download failed', 'Try again.')
    }
  }

  const getCategory = (mime: string): string => {
    if (mime.startsWith('video/')) return 'video'
    if (mime.startsWith('image/')) return 'image'
    if (mime.includes('pdf') || mime.includes('document') || mime.includes('word')) return 'document'
    return 'other'
  }

  const planTier = user?.plan_tier || 'free'
  const storageTotal = STORAGE_LIMITS[planTier]
  const storageUsed = user?.storage_used_bytes || 0
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100))

  const filteredFiles = activeCategory === 'all' ? files : files.filter((f) => f.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Storage quota */}
      <div className="card-static">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-gold" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Vault Storage</p>
              <p className="text-xs mono-text text-teal">AEF-VAULT-SECURE-{planTier.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="mono-text text-sm text-gold">{formatBytes(storageUsed)} <span className="text-text-secondary">/ {formatBytes(storageTotal)}</span></p>
            <p className="text-xs text-text-secondary">{storagePercent}% used</p>
          </div>
        </div>
        <ProgressBar value={storagePercent} color={storagePercent > 80 ? 'threat' : storagePercent > 60 ? 'warning' : 'gold'} size="lg" />
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
          dragging ? 'border-gold bg-gold-subtle' : 'hover:border-gold/40 hover:bg-gold-subtle/50'
        )}
        style={{ borderColor: dragging ? '#C9A84C' : 'rgba(45,212,191,0.2)', background: dragging ? 'rgba(201,168,76,0.06)' : 'rgba(12,26,15,0.5)' }}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
          {uploading ? (
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-gold" />
          )}
        </div>
        <p className="font-semibold text-text-primary mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {uploading ? 'ENCRYPTING FILE...' : 'Drag files here or click to upload'}
        </p>
        <p className="text-xs text-text-secondary">MP4, MOV, JPG, PNG, PDF, ZIP — max 5GB per file</p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-teal">
          <Lock className="w-3 h-3" /> All files encrypted at rest with AES-256
        </p>
      </div>

      {/* Proof of Ownership Package — Section 11 */}
      <ProofOfOwnership />

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 capitalize"
            style={{
              background: activeCategory === cat ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeCategory === cat ? 'rgba(201,168,76,0.4)' : 'rgba(45,212,191,0.1)'}`,
              color: activeCategory === cat ? '#C9A84C' : '#86EFAC',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* File grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-20">
          <HardDrive className="w-14 h-14 text-text-secondary mx-auto mb-4" />
          <p className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your vault is empty.
          </p>
          <p className="text-text-secondary text-sm mt-1">Upload your first file — it takes 30 seconds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredFiles.map((file, i) => {
              const IconComp = FILE_ICONS[file.category] || File
              const color = CATEGORY_COLORS[file.category] || '#9CA3AF'
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative rounded-2xl p-5 transition-all duration-200 hover:border-gold/25"
                  style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.08)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                    <IconComp className="w-6 h-6" style={{ color }} />
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate mb-1" title={file.file_name}>{file.file_name}</p>
                  <p className="text-xs text-text-secondary mb-2">{formatBytes(file.file_size_bytes)}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-teal py-0 text-[10px] flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> ENCRYPTED</span>
                    <span className="text-xs text-text-secondary">{timeAgo(file.uploaded_at)}</span>
                  </div>
                  {/* Hover actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-teal hover:bg-teal/10 transition-colors border"
                      style={{ borderColor: 'rgba(45,212,191,0.2)' }}
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this file?')) deleteMutation.mutate(file.id) }}
                      className="p-2 rounded-lg text-xs text-threat hover:bg-threat/10 transition-colors border"
                      style={{ borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
