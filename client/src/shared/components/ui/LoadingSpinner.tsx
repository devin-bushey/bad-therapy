import { cn } from '../../utils/cn'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center text-earth-500', className)}>
      <div
        className={cn(
          'animate-spin border-2 border-current border-t-transparent rounded-full',
          sizeClasses[size]
        )}
      />
    </div>
  )
}