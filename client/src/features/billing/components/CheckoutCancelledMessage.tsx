interface CheckoutCancelledMessageProps {
  onDismiss?: () => void
  className?: string
}

export function CheckoutCancelledMessage({ 
  onDismiss, 
  className = "mb-6" 
}: CheckoutCancelledMessageProps) {
  return (
    <section className={className}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-yellow-800 font-medium mb-2">Checkout Canceled</h3>
            <p className="text-yellow-700 text-sm">
              No worries! You can upgrade to Premium anytime below.
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-yellow-500 hover:text-yellow-700 ml-4 p-1"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}