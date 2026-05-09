import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  animate?: boolean
  delay?: number
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  animate = false,
  delay = 0,
  onClick,
}) => {
  const baseClass = hover ? 'card' : 'card-static'

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className={cn(baseClass, className, onClick && 'cursor-pointer')}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cn(baseClass, className, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
