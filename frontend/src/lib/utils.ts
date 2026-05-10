import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'MMM dd, yyyy HH:mm')
}

export function getSecurityGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#C9A84C'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#EF4444'
    case 'high': return '#F97316'
    case 'medium': return '#F59E0B'
    case 'low': return '#22C55E'
    default: return '#86EFAC'
  }
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'high': return '#EF4444'
    case 'medium': return '#F59E0B'
    case 'low': return '#22C55E'
    default: return '#86EFAC'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const PLAN_FEATURES: Record<string, string[]> = {
  vault_upload: ['standard', 'pro', 'enterprise'],
  unlimited_platforms: ['pro', 'enterprise'],
  recovery_playbook: ['pro', 'enterprise'],
  ai_assistant: ['standard', 'pro', 'enterprise'],
  priority_support: ['pro', 'enterprise'],
  multi_dashboard: ['enterprise'],
  white_label: ['enterprise'],
}

export function hasFeature(planTier: string, feature: string): boolean {
  return PLAN_FEATURES[feature]?.includes(planTier) ?? false
}

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#010101',
  youtube: '#FF0000',
  x: '#1DA1F2',
  linkedin: '#0077B5',
  email: '#2DD4BF',
  facebook: '#1877F2',
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  email: 'Email',
  facebook: 'Facebook',
}
