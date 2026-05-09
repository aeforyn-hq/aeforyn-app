import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('aeforyn_cookies_accepted'))

  const accept = () => {
    localStorage.setItem('aeforyn_cookies_accepted', 'true')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm rounded-2xl p-5 flex gap-4 items-start"
          style={{
            background: 'rgba(12,26,15,0.95)',
            border: '1px solid rgba(45,212,191,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Cookie className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <p className="text-sm text-text-secondary leading-relaxed">
              We use essential cookies only. No tracking, no ads. Your data stays yours.
            </p>
            <button onClick={accept} className="btn-primary text-xs py-2 px-4 w-full">
              Accept & Continue
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
