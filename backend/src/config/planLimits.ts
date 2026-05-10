export const PLAN_LIMITS = {
  free: {
    storage_bytes: 2 * 1024 * 1024 * 1024,
    max_platforms: 1,
    monthly_scans: 5,
    has_recovery: false,
    has_ai_assistant: false,
    has_priority_support: false,
  },
  standard: {
    storage_bytes: 10 * 1024 * 1024 * 1024,
    max_platforms: 5,
    monthly_scans: 50,
    has_recovery: false,
    has_ai_assistant: true,
    has_priority_support: false,
  },
  pro: {
    storage_bytes: 50 * 1024 * 1024 * 1024,
    max_platforms: -1,
    monthly_scans: 999,
    has_recovery: true,
    has_ai_assistant: true,
    has_priority_support: true,
  },
  enterprise: {
    storage_bytes: 200 * 1024 * 1024 * 1024,
    max_platforms: -1,
    monthly_scans: 999,
    has_recovery: true,
    has_ai_assistant: true,
    has_priority_support: true,
  },
} as const

export const STRIPE_PRICES = {
  standard_monthly: 'price_standard_monthly',
  standard_annual: 'price_standard_annual',
  pro_monthly: 'price_pro_monthly',
  pro_annual: 'price_pro_annual',
}

export const PLAN_PRICES_USD = {
  free: 0,
  standard: 29,
  pro: 49,
  enterprise: null,
}
