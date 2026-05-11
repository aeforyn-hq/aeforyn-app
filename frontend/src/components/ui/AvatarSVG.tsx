import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// 20 illustrated character avatars — inline SVGs with distinct styles
export const AVATAR_DEFS = [
  { id: 'a1', label: 'Cyber Gold',   bg: '#1A0E00' },
  { id: 'a2', label: 'Teal Hacker',  bg: '#001A17' },
  { id: 'a3', label: 'Red Fox',      bg: '#1A0505' },
  { id: 'a4', label: 'Purple Witch', bg: '#120A1A' },
  { id: 'a5', label: 'Neon Green',   bg: '#0A1A0A' },
  { id: 'a6', label: 'Ice Blue',     bg: '#050D1A' },
  { id: 'a7', label: 'Lava',         bg: '#1A0800' },
  { id: 'a8', label: 'Phantom',      bg: '#0A0A0A' },
  { id: 'a9', label: 'Storm',        bg: '#0A0F1A' },
  { id: 'a10', label: 'Solar',       bg: '#1A1200' },
  { id: 'a11', label: 'Ocean',       bg: '#001219' },
  { id: 'a12', label: 'Crimson',     bg: '#190208' },
  { id: 'a13', label: 'Mint',        bg: '#071914' },
  { id: 'a14', label: 'Dusk',        bg: '#120A19' },
  { id: 'a15', label: 'Ember',       bg: '#190C00' },
  { id: 'a16', label: 'Arctic',      bg: '#071419' },
  { id: 'a17', label: 'Sakura',      bg: '#190813' },
  { id: 'a18', label: 'Matrix',      bg: '#001907' },
  { id: 'a19', label: 'Nebula',      bg: '#080A19' },
  { id: 'a20', label: 'Titan',       bg: '#111119' },
] as const

export type AvatarId = typeof AVATAR_DEFS[number]['id']

// Each avatar is defined by its unique SVG face elements
const FACE_COLORS: Record<AvatarId, string> = {
  a1: '#F5C97A', a2: '#7EEADB', a3: '#F07070', a4: '#C87EF5',
  a5: '#7EF5A0', a6: '#7EC6F5', a7: '#F5A07E', a8: '#B0B0C8',
  a9: '#8AB0F5', a10: '#F5D87E', a11: '#7EE0F5', a12: '#F5807E',
  a13: '#7EF5C0', a14: '#C07EF5', a15: '#F5B07E', a16: '#7EE4F5',
  a17: '#F57EC0', a18: '#7EF580', a19: '#907EF5', a20: '#C0C0F5',
}

const HAIR_COLORS: Record<AvatarId, string> = {
  a1: '#C9A84C', a2: '#2DD4BF', a3: '#EF4444', a4: '#9146FF',
  a5: '#22C55E', a6: '#60A5FA', a7: '#F97316', a8: '#6B7280',
  a9: '#3B82F6', a10: '#F59E0B', a11: '#06B6D4', a12: '#DC2626',
  a13: '#10B981', a14: '#7C3AED', a15: '#EA580C', a16: '#0EA5E9',
  a17: '#DB2777', a18: '#16A34A', a19: '#6D28D9', a20: '#4B5563',
}

// Hair style variants (0-4)
const HAIR_STYLE: Record<AvatarId, number> = {
  a1: 0, a2: 1, a3: 2, a4: 3, a5: 4, a6: 0, a7: 1, a8: 2, a9: 3, a10: 4,
  a11: 0, a12: 1, a13: 2, a14: 3, a15: 4, a16: 0, a17: 1, a18: 2, a19: 3, a20: 4,
}

// Accessory variants (0=none, 1=glasses, 2=headset, 3=cap, 4=mask)
const ACCESSORY: Record<AvatarId, number> = {
  a1: 1, a2: 2, a3: 0, a4: 3, a5: 4, a6: 1, a7: 0, a8: 2, a9: 3, a10: 0,
  a11: 4, a12: 1, a13: 0, a14: 2, a15: 3, a16: 0, a17: 4, a18: 1, a19: 2, a20: 3,
}

function renderHair(style: number, color: string) {
  switch (style) {
    case 0: return <path d="M10 20 Q16 6 28 8 Q40 6 38 20 Q36 10 28 10 Q20 10 10 20Z" fill={color} />
    case 1: return <path d="M8 22 Q12 4 28 6 Q44 4 40 22 Q38 8 28 9 Q18 9 8 22Z" fill={color} />
    case 2: return <><path d="M10 22 Q14 4 28 6 Q42 4 38 22" fill={color} stroke={color} strokeWidth="3" strokeLinejoin="round" /><path d="M26 6 Q28 2 30 6" fill={color} /></>
    case 3: return <path d="M8 20 Q10 2 28 4 Q46 2 48 20 Q44 12 28 11 Q12 12 8 20Z" fill={color} />
    default: return <ellipse cx="28" cy="13" rx="13" ry="9" fill={color} opacity="0.9" />
  }
}

function renderAccessory(type: number, color: string) {
  switch (type) {
    case 1: // glasses
      return (
        <g>
          <rect x="16" y="26" width="9" height="6" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <rect x="31" y="26" width="9" height="6" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
          <line x1="25" y1="29" x2="31" y2="29" stroke={color} strokeWidth="1.5" opacity="0.8" />
        </g>
      )
    case 2: // headset
      return (
        <g>
          <path d="M14 22 Q14 15 28 15 Q42 15 42 22" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
          <rect x="12" y="22" width="4" height="7" rx="2" fill={color} opacity="0.8" />
          <rect x="40" y="22" width="4" height="7" rx="2" fill={color} opacity="0.8" />
          <line x1="12" y1="29" x2="10" y2="34" stroke={color} strokeWidth="1.5" opacity="0.8" />
        </g>
      )
    case 3: // cap
      return (
        <g>
          <path d="M12 20 Q16 10 28 9 Q40 10 44 20" fill={color} opacity="0.85" />
          <rect x="10" y="18" width="36" height="4" rx="2" fill={color} opacity="0.85" />
          <rect x="10" y="20" width="20" height="3" rx="1.5" fill={color} opacity="0.6" />
        </g>
      )
    case 4: // face mask (cyberpunk)
      return (
        <g>
          <rect x="17" y="34" width="22" height="12" rx="4" fill={color} opacity="0.7" />
          <line x1="22" y1="38" x2="22" y2="42" stroke="#071E1C" strokeWidth="1" opacity="0.5" />
          <line x1="28" y1="38" x2="28" y2="42" stroke="#071E1C" strokeWidth="1" opacity="0.5" />
          <line x1="34" y1="38" x2="34" y2="42" stroke="#071E1C" strokeWidth="1" opacity="0.5" />
        </g>
      )
    default: return null
  }
}

function AvatarFace({ id }: { id: AvatarId }) {
  const faceColor = FACE_COLORS[id]
  const hairColor = HAIR_COLORS[id]
  const hairStyle = HAIR_STYLE[id]
  const accessory = ACCESSORY[id]

  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Face */}
      <ellipse cx="28" cy="32" rx="16" ry="18" fill={faceColor} />
      {/* Hair */}
      {renderHair(hairStyle, hairColor)}
      {/* Eyes */}
      <ellipse cx="22" cy="28" rx="3" ry="3.5" fill="#071E1C" />
      <ellipse cx="34" cy="28" rx="3" ry="3.5" fill="#071E1C" />
      {/* Eye shine */}
      <circle cx="23.5" cy="26.5" r="1" fill="white" opacity="0.7" />
      <circle cx="35.5" cy="26.5" r="1" fill="white" opacity="0.7" />
      {/* Nose */}
      <path d="M27 32 Q28 34 29 32" stroke="#071E1C" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Mouth */}
      <path d="M22 37 Q28 41 34 37" stroke="#071E1C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Accessory */}
      {renderAccessory(accessory, hairColor)}
      {/* Neck */}
      <rect x="24" y="48" width="8" height="6" rx="2" fill={faceColor} />
      {/* Body hint */}
      <path d="M16 54 Q20 50 28 50 Q36 50 40 54" fill={hairColor} opacity="0.6" />
    </svg>
  )
}

/** Renders the avatar circle at any size */
export function AvatarDisplay({ id, size = 40 }: { id: AvatarId | string; size?: number }) {
  const def = AVATAR_DEFS.find((a) => a.id === id)
  const bg = def?.bg || '#0A2422'
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, background: bg, border: '2px solid rgba(245,158,11,0.25)' }}
    >
      <AvatarFace id={(id as AvatarId) || 'a1'} />
    </div>
  )
}

interface AvatarPickerProps {
  value: AvatarId | string
  onChange: (id: AvatarId) => void
}

/** Scrollable dropdown grid avatar picker */
export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 p-2 rounded-xl transition-all duration-150 hover:bg-white/5"
        style={{ border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <AvatarDisplay id={value || 'a1'} size={56} />
        <div className="text-left">
          <p className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {AVATAR_DEFS.find((a) => a.id === value)?.label || 'Choose avatar'}
          </p>
          <p className="text-xs text-text-secondary">Click to change</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 opacity-60">
          <path d={open ? 'M4 10L8 6 12 10' : 'M4 6L8 10 12 6'} stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#071426',
              border: '1px solid rgba(245,158,11,0.2)',
              width: '320px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
              <p className="text-xs font-semibold text-gold uppercase tracking-widest" style={{ letterSpacing: '1.5px' }}>
                Choose your avatar
              </p>
            </div>
            <div
              className="grid grid-cols-5 gap-2.5 p-4 overflow-y-auto"
              style={{ maxHeight: '260px' }}
            >
              {AVATAR_DEFS.map((def) => {
                const isSelected = value === def.id
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => { onChange(def.id); setOpen(false) }}
                    className="relative group transition-transform duration-150 hover:scale-110 focus:outline-none"
                    title={def.label}
                  >
                    <AvatarDisplay id={def.id} size={48} />
                    {isSelected && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid #F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.5)' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
