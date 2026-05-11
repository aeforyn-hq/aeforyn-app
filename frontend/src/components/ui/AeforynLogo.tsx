import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface AeforynLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
  showTagline?: boolean
  className?: string
  /** When true wraps the logo in a Link to /billing#why-aeforyn */
  clickable?: boolean
}

export const AeforynLogo: React.FC<AeforynLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className,
  clickable = false,
}) => {
  const iconSizes = { sm: 28, md: 36, lg: 48, xl: 72 }
  const iconSize = iconSizes[size]
  const wordmarkSizes = { sm: '14px', md: '18px', lg: '24px', xl: '36px' }
  const taglineSizes = { sm: '8px', md: '9px', lg: '10px', xl: '12px' }

  const inner = (
    <motion.div
      className={cn('flex items-center gap-2.5 group cursor-pointer select-none', className)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Animated hex icon */}
      <div className="relative flex-shrink-0">
        {/* Outer glow ring — pulses */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)' }}
          animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lgHex1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D78E" />
              <stop offset="40%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#7A5F28" />
            </linearGradient>
            <linearGradient id="lgHex2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E4C46A" />
              <stop offset="50%" stopColor="#9A7A35" />
              <stop offset="100%" stopColor="#5A3F10" />
            </linearGradient>
            <linearGradient id="lgHex3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#F5D78E" />
              <stop offset="100%" stopColor="#7A5F28" />
            </linearGradient>
            <filter id="hexGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Circuit traces */}
          <line x1="24" y1="0" x2="24" y2="8" stroke="#F59E0B" strokeWidth="0.6" opacity="0.3"/>
          <line x1="48" y1="24" x2="40" y2="24" stroke="#F59E0B" strokeWidth="0.6" opacity="0.3"/>
          <line x1="0" y1="24" x2="8" y2="24" stroke="#F59E0B" strokeWidth="0.6" opacity="0.3"/>
          <line x1="38" y1="6" x2="34" y2="12" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.2"/>
          <line x1="10" y1="42" x2="14" y2="36" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.2"/>

          {/* Top hex — 3D shadow layer */}
          <polygon points="24,8 31,12 31,18 24,22 17,18 17,12" fill="rgba(0,0,0,0.5)" transform="translate(1,1)" />
          <polygon points="24,6 31,10 31,18 24,22 17,18 17,10" fill="url(#lgHex1)" filter="url(#hexGlow)" />
          <polygon points="24,8 29.5,11 29.5,17 24,20 18.5,17 18.5,11" fill="#071E1C" opacity="0.25" />

          {/* Bottom-left hex — 3D shadow layer */}
          <polygon points="16,24 23,28 23,34 16,38 9,34 9,28" fill="rgba(0,0,0,0.5)" transform="translate(1,1)" />
          <polygon points="16,22 23,26 23,34 16,38 9,34 9,26" fill="url(#lgHex2)" filter="url(#hexGlow)" />
          <polygon points="16,24 21.5,27 21.5,33 16,36 10.5,33 10.5,27" fill="#071E1C" opacity="0.25" />

          {/* Bottom-right hex — 3D shadow layer */}
          <polygon points="32,24 39,28 39,34 32,38 25,34 25,28" fill="rgba(0,0,0,0.5)" transform="translate(1,1)" />
          <polygon points="32,22 39,26 39,34 32,38 25,34 25,26" fill="url(#lgHex3)" filter="url(#hexGlow)" />
          <polygon points="32,24 37.5,27 37.5,33 32,36 26.5,33 26.5,27" fill="#071E1C" opacity="0.25" />

          {/* Centre dot highlight */}
          <circle cx="24" cy="26" r="1.5" fill="#F5D78E" opacity="0.7" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col relative">
          {/* 3D shadow text layer */}
          <span
            aria-hidden
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: wordmarkSizes[size],
              letterSpacing: '4px',
              lineHeight: 1,
              color: '#7A5F28',
              position: 'absolute',
              top: '2px',
              left: '2px',
              userSelect: 'none',
            }}
          >
            AEFORYN
          </span>
          {/* Gold metallic text */}
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: wordmarkSizes[size],
              letterSpacing: '4px',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #F5D78E 0%, #C9A84C 45%, #9A7A35 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))',
              position: 'relative',
              zIndex: 1,
            }}
          >
            AEFORYN
          </span>

          {/* Glowing underline */}
          <motion.div
            style={{
              height: '1.5px',
              borderRadius: '1px',
              marginTop: '3px',
              background: 'linear-gradient(90deg, transparent, #F59E0B, #C9A84C, #F59E0B, transparent)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {showTagline && (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: taglineSizes[size],
                color: '#2DD4BF',
                letterSpacing: '3px',
                lineHeight: 1.4,
                marginTop: '4px',
              }}
            >
              YOUR ACCOUNT. YOUR INCOME. PROTECTED.
            </span>
          )}
        </div>
      )}
    </motion.div>
  )

  if (clickable) {
    return (
      <Link
        to="/billing"
        state={{ openWhyAeforyn: true }}
        style={{ textDecoration: 'none', display: 'inline-flex' }}
        className="logo-link"
      >
        {inner}
      </Link>
    )
  }

  return inner
}
