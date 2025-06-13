import { cn } from '../../utils/cn'

interface SuccessToastProps {
  message: string
  className?: string
}

export function SuccessToast({ message, className }: SuccessToastProps) {
  return (
    <div
      className={cn(
        'absolute top-4 right-4 z-10',
        'bg-green-500 text-white px-4 py-2 rounded-lg',
        'text-sm font-medium shadow-lg',
        'animate-in fade-in-0 slide-in-from-top-2',
        className
      )}
    >
      {message}
    </div>
  )
}