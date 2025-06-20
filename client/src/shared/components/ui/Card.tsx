import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-warm-200 bg-warm-100 p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}