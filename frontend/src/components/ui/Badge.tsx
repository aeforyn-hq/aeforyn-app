import React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'gold' | 'teal' | 'safe' | 'warning' | 'threat' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variantClass = {
    gold: 'badge-gold',
    teal: 'badge-teal',
    safe: 'badge-safe',
    warning: 'badge-warning',
    threat: 'badge-threat',
    default: 'badge bg-white/5 text-text-secondary border border-white/10',
  }[variant]

  return (
    <span className={cn(variantClass, className)}>
      {children}
    </span>
  )
}

export const SeverityBadge: React.FC<{ severity: string; className?: string }> = ({ severity, className }) => {
  const map: Record<string, BadgeVariant> = {
    critical: 'threat',
    high: 'threat',
    medium: 'warning',
    low: 'safe',
  }
  return <Badge variant={map[severity] || 'default'} className={className}>{severity}</Badge>
}

export const RiskBadge: React.FC<{ risk: string; className?: string }> = ({ risk, className }) => {
  const map: Record<string, BadgeVariant> = {
    high: 'threat',
    medium: 'warning',
    low: 'safe',
  }
  return <Badge variant={map[risk] || 'default'} className={className}>{risk} risk</Badge>
}

export const PlanBadge: React.FC<{ plan: string; className?: string }> = ({ plan, className }) => {
  const map: Record<string, BadgeVariant> = {
    free: 'default',
    standard: 'teal',
    pro: 'gold',
    enterprise: 'gold',
  }
  return <Badge variant={map[plan] || 'default'} className={className}>{plan}</Badge>
}
