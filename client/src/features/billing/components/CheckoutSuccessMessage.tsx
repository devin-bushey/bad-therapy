import { useBillingContext } from '../contexts/BillingContext'

interface CheckoutSuccessMessageProps {
  sessionId?: string | null
  onDismiss?: () => void
  className?: string
}

export function CheckoutSuccessMessage({ 
  sessionId, 
  onDismiss, 
  className = "mb-6" 
}: CheckoutSuccessMessageProps) {
  const { openBillingPortal } = useBillingContext()
  
  const handleManageSubscription = () => {
    if (sessionId) {
      openBillingPortal(sessionId)
    }
  }

  return (
    <section className={className}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-green-800 font-medium mb-2">🎉 Subscription successful!</h3>
            <p className="text-green-700 text-sm mb-3">
              Welcome to Premium! You now have unlimited access to all features.
            </p>
            {sessionId && (
              <button
                onClick={handleManageSubscription}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-green-500 hover:text-green-700 ml-4 p-1"
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