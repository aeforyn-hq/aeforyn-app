import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'gold' | 'teal' | 'safe' | 'warning' | 'threat'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'gold',
  size = 'md',
  showLabel = false,
  label,
  className,
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100))

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

  const fills = {
    gold: 'linear-gradient(90deg, #9A7A35, #C9A84C)',
    teal: 'linear-gradient(90deg, #0D9488, #2DD4BF)',
    safe: 'linear-gradient(90deg, #15803d, #22C55E)',
    warning: 'linear-gradient(90deg, #d97706, #F59E0B)',
    threat: 'linear-gradient(90deg, #dc2626, #EF4444)',
  }

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showLabel && <span className="text-xs mono-text text-gold">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', heights[size], 'bg-white/5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out')}
          style={{ width: `${pct}%`, background: fills[color] }}
        />
      </div>
    </div>
  )
}
