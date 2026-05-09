import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines }) => {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('animate-pulse rounded-lg bg-teal/5', className, i === lines - 1 && 'w-3/4')}
            style={{ height: '16px' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn('animate-pulse rounded-lg', 'bg-gradient-to-r from-teal/5 via-teal/10 to-teal/5 bg-[length:200%_100%]', className)}
      style={{ animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }}
    />
  )
}

export const CardSkeleton: React.FC = () => (
  <div className="card-static p-7">
    <Skeleton className="h-5 w-1/3 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-4/5" />
  </div>
)
