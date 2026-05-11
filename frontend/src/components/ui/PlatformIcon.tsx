interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
}

const PLATFORM_SLUGS: Record<string, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  youtube: 'youtube',
  x: 'x',
  twitter: 'x',
  facebook: 'facebook',
  linkedin: 'linkedin',
  snapchat: 'snapchat',
  pinterest: 'pinterest',
  twitch: 'twitch',
  discord: 'discord',
  reddit: 'reddit',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  spotify: 'spotify',
  patreon: 'patreon',
  onlyfans: 'onlyfans',
  substack: 'substack',
  medium: 'medium',
  github: 'github',
  gmail: 'gmail',
  email: 'gmail',
  google: 'google',
  shopify: 'shopify',
  etsy: 'etsy',
  gumroad: 'gumroad',
  ko_fi: 'kofi',
  'ko-fi': 'kofi',
  buymeacoffee: 'buymeacoffee',
  behance: 'behance',
  dribbble: 'dribbble',
  fiverr: 'fiverr',
  upwork: 'upwork',
  threads: 'threads',
  bluesky: 'bluesky',
  mastodon: 'mastodon',
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#69C9D0',
  youtube: '#FF0000',
  x: '#FFFFFF',
  twitter: '#FFFFFF',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  snapchat: '#FFFC00',
  pinterest: '#E60023',
  twitch: '#9146FF',
  discord: '#5865F2',
  reddit: '#FF4500',
  telegram: '#2CA5E0',
  whatsapp: '#25D366',
  spotify: '#1DB954',
  patreon: '#FF424D',
  onlyfans: '#00AFF0',
  substack: '#FF6719',
  medium: '#FFFFFF',
  github: '#FFFFFF',
  gmail: '#EA4335',
  email: '#EA4335',
  google: '#4285F4',
  shopify: '#96BF48',
  etsy: '#F1641E',
  gumroad: '#36A9AE',
  ko_fi: '#29ABE0',
  'ko-fi': '#29ABE0',
  buymeacoffee: '#FFDD00',
  behance: '#1769FF',
  dribbble: '#EA4C89',
  fiverr: '#1DBF73',
  upwork: '#6FDA44',
  threads: '#FFFFFF',
  bluesky: '#0085FF',
  mastodon: '#6364FF',
}

export function PlatformIcon({ platform, size = 20, className }: PlatformIconProps) {
  const slug = PLATFORM_SLUGS[platform.toLowerCase()] || platform.toLowerCase()
  const color = PLATFORM_COLORS[platform.toLowerCase()] || '#86EFAC'

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}`}
      alt={platform}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block' }}
      onError={(e) => {
        const el = e.target as HTMLImageElement
        el.style.display = 'none'
      }}
    />
  )
}
