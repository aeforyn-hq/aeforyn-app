// Demo data for when API is not connected
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { HardDrive, Upload, Download, Trash2, Lock, FileVideo, FileImage, FileText, Key, File } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'
import { formatBytes, timeAgo, cn } from '@/lib/utils'
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
      const { data } = await api.get<{ url: string; file_name: string }>(`/api/vault/download/${file.id}`)
      const a = document.createElement('a')
      a.href = data.url
      a.download = data.file_name
      a.click()
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
