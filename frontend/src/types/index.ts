export interface User {
  id: string
  email: string
  creator_handle?: string
  platforms_connected: string[]
  plan_tier: PlanTier
  storage_used_bytes: number
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export type PlanTier = 'free' | 'standard' | 'creator' | 'pro' | 'agency' | 'enterprise'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  plan_tier: PlanTier
  status: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
}

export interface VaultFile {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_size_bytes: number
  r2_key: string
  category: 'video' | 'image' | 'document' | 'credential' | 'other' | 'general'
  is_encrypted: boolean
  uploaded_at: string
}

export interface Platform {
  id: string
  user_id: string
  platform: PlatformName
  handle?: string
  health_score: number
  last_checked_at?: string
  status: 'safe' | 'warning' | 'threat' | 'monitoring'
  connected_at: string
}

export type PlatformName = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin' | 'email' | 'facebook'

export interface Threat {
  id: string
  user_id: string
  threat_type: 'login_attempt' | 'phishing' | 'account_takeover' | 'suspicious_access' | 'data_breach' | 'other'
  platform?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description?: string
  location?: string
  is_resolved: boolean
  detected_at: string
  resolved_at?: string
}

export interface ScanResult {
  id: string
  user_id: string
  input_text: string
  risk_level: 'low' | 'medium' | 'high'
  confidence_score: number
  red_flags: string[]
  explanation: string
  recommendation: string
  scanned_at: string
}

export interface RecoverySession {
  id: string
  user_id: string
  platform: string
  incident_type: string
  steps_completed: number
  total_steps: number
  status: 'in_progress' | 'completed' | 'abandoned'
  incident_report?: Record<string, unknown>
  started_at: string
  completed_at?: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIConversation {
  id: string
  user_id: string
  messages: AIMessage[]
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  plan_tier: PlanTier
  storage_bytes: number
  max_platforms: number
  monthly_scans: number
  has_recovery: boolean
  has_ai_assistant: boolean
  has_priority_support: boolean
}

export interface ThreatSummary {
  critical: number
  high: number
  medium: number
  low: number
  total: number
  resolved: number
}

export interface DashboardData {
  security_score: number
  threats_summary: ThreatSummary
  platforms: Platform[]
  recent_threats: Threat[]
  recent_files: VaultFile[]
  storage_used: number
  storage_total: number
}
