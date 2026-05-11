import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#071E1C',
        'bg-secondary': '#051614',
        'bg-card': '#0A2422',
        'bg-card-hover': '#0D2E2B',
        'bg-input': '#091F1D',
        'gold': '#C9A84C',
        'gold-light': '#E4C46A',
        'gold-dim': '#9A7A35',
        'teal': '#2DD4BF',
        'teal-mid': '#14B8A6',
        'teal-dark': '#0D9488',
        'green-glow': '#4ADE80',
        'safe': '#22C55E',
        'warning': '#F59E0B',
        'threat': '#EF4444',
        'text-primary': '#F0FDF4',
        'text-secondary': '#86EFAC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #9A7A35)',
        'gold-gradient-hover': 'linear-gradient(135deg, #E4C46A, #C9A84C)',
        'teal-gradient': 'linear-gradient(135deg, #2DD4BF, #0D9488)',
      },
      animation: {
        'pulse-teal': 'pulse-teal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-teal': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.6)' },
        },
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(201,168,76,0.25)',
        'gold-lg': '0 6px 30px rgba(201,168,76,0.40)',
        'teal': '0 4px 20px rgba(45,212,191,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
