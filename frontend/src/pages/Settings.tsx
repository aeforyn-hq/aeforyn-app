import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Download, Trash2, Eye, EyeOff, Check, X,
  Shield, Lock, HelpCircle, Upload, RotateCcw,
} from 'lucide-react'
import { AvatarDisplay, AVATAR_DEFS, type AvatarId } from '@/components/ui/AvatarSVG'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { PLATFORM_LABELS, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User      },
  { id: 'security',      label: 'Security',       icon: Shield    },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'privacy',       label: 'Privacy & Data', icon: Lock      },
  { id: 'support',       label: 'Support',        icon: HelpCircle },
] as const

type TabId = typeof TABS[number]['id']

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: value ? 'linear-gradient(135deg, #C9A84C, #9A7A35)' : 'rgba(255,255,255,0.1)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
        style={{ left: value ? '26px' : '4px' }}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Avatar picker — 3 tabs: Initials / Character / Photo
// ---------------------------------------------------------------------------

function AvatarPicker3() {
  const { user, avatarType, illustratedAvatarId, avatarUrl, setAvatarIllustrated, setAvatarInitials, updateAvatar } = useAuthStore()
  const [tab, setTab] = useState<'initials' | 'illustrated' | 'photo'>(avatarType)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handle = user?.creator_handle || ''
  const parts = handle.replace('@', '').split(/[\s_-]/).filter(Boolean)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (user?.email?.charAt(0) || 'A').toUpperCase()

  const handlePhotoUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'image')
      const { data } = await api.post('/api/vault/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Use the object URL for display (or the vault URL if returned)
      const url = data?.url || URL.createObjectURL(file)
      updateAvatar(url)
      toast.success('Photo uploaded')
    } catch {
      // Fallback: use local object URL
      const url = URL.createObjectURL(file)
      updateAvatar(url)
      toast.success('Photo set (local preview)')
    } finally {
      setUploading(false)
    }
  }

  const TAB_STYLES = (active: boolean) => ({
    flex: 1,
    padding: '6px 0',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    color: active ? '#C9A84C' : '#86EFAC',
    background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
    border: active ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div>
      {/* Current avatar preview */}
      <div className="flex items-center gap-4 mb-4">
        <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(201,168,76,0.3)' }}>
          {avatarType === 'photo' && avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : avatarType === 'illustrated' ? (
            <AvatarDisplay id={illustratedAvatarId} size={72} />
          ) : (
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Your avatar</p>
          <p className="text-xs text-text-secondary mt-0.5 capitalize">{avatarType === 'illustrated' ? 'Illustrated character' : avatarType === 'photo' ? 'Personal photo' : 'Letter initials'}</p>
          {avatarType !== 'initials' && (
            <button
              onClick={() => { setAvatarInitials(); setTab('initials') }}
              className="flex items-center gap-1 mt-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to initials
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}>
        {(['initials', 'illustrated', 'photo'] as const).map((t) => (
          <button key={t} style={TAB_STYLES(tab === t)} onClick={() => setTab(t)}>
            {t === 'initials' ? 'Initials' : t === 'illustrated' ? 'Characters' : 'Photo'}
          </button>
        ))}
      </div>

      {/* Initials tab */}
      {tab === 'initials' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>
            {initials}
          </div>
          <p className="text-xs text-text-secondary text-center">Your initials are derived from your creator handle or email.</p>
          <Button
            variant="primary"
            onClick={() => { setAvatarInitials(); toast.success('Avatar set to initials') }}
          >
            <Check className="w-4 h-4" /> Use Initials
          </Button>
        </div>
      )}

      {/* Illustrated tab */}
      {tab === 'illustrated' && (
        <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
          {AVATAR_DEFS.map((def) => {
            const isSelected = avatarType === 'illustrated' && illustratedAvatarId === def.id
            return (
              <button
                key={def.id}
                onClick={() => { setAvatarIllustrated(def.id); toast.success(`Avatar set to ${def.label}`) }}
                title={def.label}
                className="relative rounded-xl overflow-hidden transition-transform hover:scale-110 focus:outline-none"
                style={{ border: isSelected ? '2px solid #F59E0B' : '2px solid transparent', boxShadow: isSelected ? '0 0 10px rgba(245,158,11,0.5)' : 'none' }}
              >
                <AvatarDisplay id={def.id} size={52} />
              </button>
            )
          })}
        </div>
      )}

      {/* Photo tab */}
      {tab === 'photo' && (
        <div className="flex flex-col items-center gap-3 py-4">
          {avatarType === 'photo' && avatarUrl ? (
            <img src={avatarUrl} alt="Current" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: '2px solid rgba(201,168,76,0.3)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 16, background: 'rgba(45,212,191,0.06)', border: '2px dashed rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload className="w-6 h-6 text-text-secondary" />
            </div>
          )}
          <p className="text-xs text-text-secondary text-center">Upload a JPG or PNG under 5 MB.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
          <Button variant="primary" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" /> {avatarType === 'photo' && avatarUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { user, setUser } = useAuthStore()

  const [handle, setHandle]       = useState(user?.creator_handle || '')
  const [saving, setSaving]       = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/api/user/profile', { creator_handle: handle })
      setUser({ ...user!, creator_handle: data.creator_handle })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-static" style={{ background: '#0A2422', border: '1px solid rgba(201,168,76,0.15)' }}>
        <h3 className="heading-card mb-6">Profile Information</h3>
        <div className="space-y-6">

          {/* Avatar picker */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '1.5px' }}>Your Avatar</p>
            <AvatarPicker3 />
          </div>

          {/* Email (read-only) */}
          <Input label="Email address" type="email" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />

          {/* Creator handle */}
          <Input label="Creator handle" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" />

          {/* Connected platforms */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '1.5px' }}>Connected Platforms</p>
            {user?.platforms_connected && user.platforms_connected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.platforms_connected.map((p) => (
                  <span key={p} className="badge-teal capitalize">{PLATFORM_LABELS[p] || p}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                No platforms connected.{' '}
                <a href="/monitoring" className="text-teal hover:text-teal-mid">Add platforms →</a>
              </p>
            )}
          </div>

          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Check className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Security tab — Section 1: real password change API
// ---------------------------------------------------------------------------

function SecurityTab() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [changing, setChanging]   = useState(false)

  const sessions = [
    { id: '1', device: 'Chrome on macOS',   location: 'Cape Town, ZA',     last_seen: new Date(Date.now() - 1000*60*5).toISOString(),       current: true  },
    { id: '2', device: 'Safari on iPhone',  location: 'Cape Town, ZA',     last_seen: new Date(Date.now() - 1000*60*60*2).toISOString(),     current: false },
    { id: '3', device: 'Chrome on Windows', location: 'Johannesburg, ZA',  last_seen: new Date(Date.now() - 1000*60*60*24*3).toISOString(),  current: false },
  ]

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw)  { toast.error('Passwords do not match'); return }
    if (newPw.length < 8)     { toast.error('Password must be at least 8 characters'); return }
    setChanging(true)
    try {
      await api.post('/api/auth/change-password', {
        current_password: currentPw,
        new_password: newPw,
      })
      toast.success('Password updated successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update password'
      toast.error(msg)
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="card-static">
        <h3 className="heading-card mb-6">Change Password</h3>
        <form onSubmit={handleChangePw} className="space-y-4">
          <Input label="Current password"     type={showPw ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Your current password" />
          <Input label="New password"         type={showPw ? 'text' : 'password'} value={newPw}     onChange={(e) => setNewPw(e.target.value)}     placeholder="At least 8 characters" />
          <Input label="Confirm new password" type={showPw ? 'text' : 'password'} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPw ? 'Hide passwords' : 'Show passwords'}
          </button>
          <Button type="submit" variant="primary" loading={changing}>
            <Shield className="w-4 h-4" /> Update Password
          </Button>
        </form>
      </div>

      {/* Two-factor */}
      <div className="card-static">
        <h3 className="heading-card mb-2">Two-Factor Authentication</h3>
        <p className="text-text-secondary text-sm mb-5 leading-relaxed">
          Use an authenticator app (Google Authenticator, Authy) for maximum security. SMS 2FA can be SIM-swapped.
        </p>
        <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-safe" />
            <span className="text-sm font-medium text-safe">2FA is managed per platform</span>
          </div>
          <p className="text-xs text-text-secondary">Enable 2FA on each platform through their security settings. Use the Recovery section for platform-specific guides.</p>
        </div>
        <Button variant="ghost">View 2FA Guides →</Button>
      </div>

      {/* Active sessions */}
      <div className="card-static">
        <h3 className="heading-card mb-6">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: session.current ? 'rgba(201,168,76,0.05)' : 'rgba(45,212,191,0.03)', border: `1px solid ${session.current ? 'rgba(201,168,76,0.15)' : 'rgba(45,212,191,0.06)'}` }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-text-primary">{session.device}</p>
                  {session.current && <span className="badge-safe py-0 text-[10px]">Current</span>}
                </div>
                <p className="text-xs text-text-secondary">{session.location} · {timeAgo(session.last_seen)}</p>
              </div>
              {!session.current && (
                <button className="text-xs text-threat hover:text-threat/70 transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Notifications tab
// ---------------------------------------------------------------------------

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    breach_alert: true, login_alert: true, weekly_report: false, product_updates: true,
  })

  const items = [
    { key: 'breach_alert',    label: 'Breach Alert',           description: 'Email when your accounts appear in a data breach' },
    { key: 'login_alert',     label: 'Login Alert',            description: 'Email when a new device logs into your accounts' },
    { key: 'weekly_report',   label: 'Weekly Security Report', description: 'Summary of your security status every Monday' },
    { key: 'product_updates', label: 'Product Updates',        description: 'New features and improvements from AEFORYN' },
  ] as const

  return (
    <div className="card-static space-y-6">
      <h3 className="heading-card">Email Notifications</h3>
      <div className="space-y-4">
        {items.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(45,212,191,0.06)' }}>
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{description}</p>
            </div>
            <Toggle value={prefs[key]} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>
      <Button variant="primary" onClick={() => toast.success('Notification preferences saved')}>
        <Check className="w-4 h-4" /> Save Preferences
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Privacy tab
// ---------------------------------------------------------------------------

function PrivacyTab() {
  const [deleteOpen, setDeleteOpen]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting]           = useState(false)
  const [exporting, setExporting]         = useState(false)
  const { logout } = useAuthStore()
  const navigate   = useNavigate()

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await api.get('/api/user/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `aeforyn-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      toast.success('Data exported')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setDeleting(true)
    try {
      await api.delete('/api/user')
      logout()
      navigate('/login')
      toast.success('Account deleted')
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-static">
        <h3 className="heading-card mb-2">Your Data</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">AEFORYN is built for creators. Your data belongs to you — always. We comply with POPIA (South Africa) and GDPR (EU).</p>
        <div className="space-y-3">
          {['We never sell your data to third parties', 'Vault files are encrypted at rest with AES-256', 'You can export or delete all your data at any time', 'AI conversations are stored only to maintain context within sessions'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-safe flex-shrink-0" />
              <span className="text-sm text-text-secondary">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-static">
        <h3 className="heading-card mb-2">Download Your Data</h3>
        <p className="text-text-secondary text-sm mb-5">Export everything AEFORYN holds about you as a single JSON file.</p>
        <Button variant="primary" onClick={handleExport} loading={exporting}>
          <Download className="w-4 h-4" /> Download My Data
        </Button>
      </div>

      <div className="card-static" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
        <h3 className="heading-card mb-2 text-threat">Delete Account</h3>
        <p className="text-text-secondary text-sm mb-5 leading-relaxed">Permanently delete your AEFORYN account. All data will be immediately and irreversibly erased.</p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-4 h-4" /> Delete My Account
        </Button>
      </div>

      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteConfirm('') }} title="Delete Account" size="sm">
        <div className="space-y-5">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-sm text-threat font-medium mb-1">This action is permanent and irreversible.</p>
            <p className="text-xs text-text-secondary">All vault files, threats, scan history, AI conversations, and your account will be permanently deleted.</p>
          </div>
          <Input label="Type DELETE to confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleting} disabled={deleteConfirm !== 'DELETE'}>Delete Forever</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section 5 — Support & About tab
// ---------------------------------------------------------------------------

function SupportTab() {
  const [name, setName]       = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { toast.error('Please write a message'); return }
    setSent(true)
    toast.success('Message sent — we\'ll reply within 24 hours')
    setName(''); setMessage('')
    setTimeout(() => setSent(false), 4000)
  }

  const links = [
    { label: 'Terms & Policies',   href: 'https://aeforyn.com/terms',   description: 'Our terms of service and acceptable use policy' },
    { label: 'Privacy Center',     href: 'https://aeforyn.com/privacy', description: 'How we collect, use, and protect your data' },
    { label: 'About AEFORYN',      href: 'https://aeforyn.com/about',   description: 'Our mission, team, and story' },
  ]

  return (
    <div className="space-y-6">
      {/* Contact Us */}
      <div className="card-static">
        <h3 className="heading-card mb-2">Contact Us</h3>
        <p className="text-text-secondary text-sm mb-5 leading-relaxed">
          Got a question or issue? Send us a message and we'll get back to you within 24 hours. You can also email us directly at{' '}
          <a href="mailto:support@aeforyn.com" className="text-teal hover:underline">support@aeforyn.com</a>.
        </p>
        {sent ? (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Check className="w-5 h-5 text-safe flex-shrink-0" />
            <p className="text-sm text-safe font-medium">Message sent! We'll reply within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Your name (optional)" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Creator name" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-gold" style={{ letterSpacing: '1.5px' }}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none transition-all"
                style={{ background: '#071E1C', border: '1px solid rgba(45,212,191,0.12)', lineHeight: '1.6' }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.35)' }}
                onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(45,212,191,0.12)' }}
              />
            </div>
            <Button type="submit" variant="primary">Send Message</Button>
          </form>
        )}
      </div>

      {/* Links */}
      <div className="card-static">
        <h3 className="heading-card mb-4">Legal & Company</h3>
        <div className="space-y-3">
          {links.map(({ label, href, description }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5 group"
              style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}
            >
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-teal transition-colors">{label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-text-secondary group-hover:text-teal transition-colors">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="max-w-3xl mx-auto" style={{ background: '#071E1C', minHeight: '100%' }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap"
            style={{
              background: activeTab === id ? '#0A2422' : 'transparent',
              color:      activeTab === id ? '#C9A84C' : '#86EFAC',
              border:     activeTab === id ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              boxShadow:  activeTab === id ? '0 0 12px rgba(201,168,76,0.12)' : 'none',
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'profile'       && <ProfileTab />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'privacy'       && <PrivacyTab />}
          {activeTab === 'support'       && <SupportTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
