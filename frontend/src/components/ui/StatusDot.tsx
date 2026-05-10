import React from 'react'
import { cn } from '@/lib/utils'

interface StatusDotProps {
  status: 'safe' | 'warning' | 'threat' | 'critical' | 'monitoring'
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, pulse = false, size = 'md', className }) => {
  const colors = {
    safe: 'bg-safe',
    warning: 'bg-warning',
    threat: 'bg-threat',
    critical: 'bg-threat',
    monitoring: 'bg-teal',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  return (
    <span className={cn('relative inline-flex', sizes[size], className)}>
      {pulse && (
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
      )}
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[status])} />
    </span>
  )
}
