interface BillingLoadingSkeletonProps {
  className?: string
}

export function BillingLoadingSkeleton({ className = "mb-8" }: BillingLoadingSkeletonProps) {
  return (
    <section className={className}>
      <div className="bg-warm-100 rounded-lg p-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-warm-200 rounded mb-2 w-32"></div>
            <div className="h-3 bg-warm-200 rounded w-48"></div>
          </div>
          <div className="h-6 bg-warm-200 rounded w-16"></div>
        </div>
      </div>
    </section>
  )
}