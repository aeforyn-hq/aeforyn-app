import { motion } from 'framer-motion'
import { AeforynLogo } from '@/components/ui/AeforynLogo'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: '#071E1C' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex w-[55%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#071E1C' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,212,191,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Circuit trace SVG background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <defs>
            <pattern id="circuit" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 0 40 L 20 40 L 20 20 L 40 20" stroke="#2DD4BF" strokeWidth="1" fill="none" />
              <path d="M 80 40 L 60 40 L 60 60 L 40 60" stroke="#2DD4BF" strokeWidth="1" fill="none" />
              <circle cx="20" cy="40" r="2" fill="#2DD4BF" />
              <circle cx="60" cy="40" r="2" fill="#2DD4BF" />
              <path d="M 0 0 L 0 20 L 20 20" stroke="#2DD4BF" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <AeforynLogo size="xl" showWordmark showTagline />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Protecting creators, freelancers, and remote workers from account takeovers, phishing, and data breaches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            <span className="text-sm text-gold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Trusted by 2,400+ creators
            </span>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 15}%`,
                opacity: 0.3,
              }}
              animate={{ y: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: '#051614' }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <AeforynLogo size="md" showWordmark />
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: '#0A2422',
              border: '1px solid rgba(201,168,76,0.15)',
              borderTop: '1px solid rgba(201,168,76,0.4)',
            }}
          >
            <div className="mb-8">
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#F0FDF4', letterSpacing: '-0.5px' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
