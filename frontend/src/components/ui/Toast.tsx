import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-safe" />,
    error: <XCircle className="w-5 h-5 text-threat" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-color" />,
    info: <Info className="w-5 h-5 text-teal" />,
  }

  const borderColors = {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#2DD4BF',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto relative rounded-xl p-4 flex items-start gap-3"
            style={{
              background: 'rgba(12,26,15,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(45,212,191,0.15)',
              borderLeft: `3px solid ${borderColors[t.type]}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{t.title}</p>
              {t.message && <p className="text-xs text-text-secondary mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-secondary hover:text-text-primary transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
