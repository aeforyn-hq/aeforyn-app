import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightElement,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-widest text-gold" style={{ letterSpacing: '1.5px' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'input-field',
            icon && 'pl-10',
            rightElement && 'pr-12',
            error && 'border-threat/50 focus:border-threat',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-threat">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-widest text-gold" style={{ letterSpacing: '1.5px' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'input-field resize-none',
          error && 'border-threat/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-threat">{error}</p>}
    </div>
  )
}
