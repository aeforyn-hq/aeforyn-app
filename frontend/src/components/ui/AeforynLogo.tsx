import React from 'react'
import { cn } from '@/lib/utils'

interface AeforynLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
  showTagline?: boolean
  className?: string
}

export const AeforynLogo: React.FC<AeforynLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className,
}) => {
  const iconSizes = { sm: 28, md: 36, lg: 48, xl: 72 }
  const iconSize = iconSizes[size]

  const wordmarkSizes = { sm: '14px', md: '18px', lg: '24px', xl: '36px' }
  const taglineSizes = { sm: '8px', md: '9px', lg: '10px', xl: '12px' }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hexGold1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E4C46A" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#7A5F28" />
          </linearGradient>
          <linearGradient id="hexGold2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="50%" stopColor="#9A7A35" />
            <stop offset="100%" stopColor="#7A5F28" />
          </linearGradient>
          <linearGradient id="hexGold3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#E4C46A" />
            <stop offset="100%" stopColor="#7A5F28" />
          </linearGradient>
        </defs>
        {/* Circuit trace lines */}
        <line x1="24" y1="0" x2="24" y2="8" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.15"/>
        <line x1="48" y1="24" x2="40" y2="24" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.15"/>
        <line x1="0" y1="24" x2="8" y2="24" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.15"/>
        <line x1="38" y1="6" x2="34" y2="12" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.15"/>
        <line x1="10" y1="42" x2="14" y2="36" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.15"/>
        {/* Top hexagon */}
        <polygon
          points="24,6 31,10 31,18 24,22 17,18 17,10"
          fill="url(#hexGold1)"
        />
        <polygon
          points="24,8 29.5,11 29.5,17 24,20 18.5,17 18.5,11"
          fill="#071E1C"
          opacity="0.3"
        />
        {/* Bottom-left hexagon */}
        <polygon
          points="16,22 23,26 23,34 16,38 9,34 9,26"
          fill="url(#hexGold2)"
        />
        <polygon
          points="16,24 21.5,27 21.5,33 16,36 10.5,33 10.5,27"
          fill="#071E1C"
          opacity="0.3"
        />
        {/* Bottom-right hexagon */}
        <polygon
          points="32,22 39,26 39,34 32,38 25,34 25,26"
          fill="url(#hexGold3)"
        />
        <polygon
          points="32,24 37.5,27 37.5,33 32,36 26.5,33 26.5,27"
          fill="#071E1C"
          opacity="0.3"
        />
      </svg>
      {showWordmark && (
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: wordmarkSizes[size],
              color: '#C9A84C',
              letterSpacing: '4px',
              lineHeight: 1,
            }}
          >
            AEFORYN
          </span>
          {showTagline && (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: taglineSizes[size],
                color: '#2DD4BF',
                letterSpacing: '3px',
                lineHeight: 1.4,
                marginTop: '3px',
              }}
            >
              YOUR ACCOUNT. YOUR INCOME.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
