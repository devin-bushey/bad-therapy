import { useBillingContext } from '../contexts/BillingContext'

interface MessageLimitReachedProps {
  errorDetails?: {
    message?: string
    current_count?: number
    limit?: number
  } | null
}

export function MessageLimitReached({ errorDetails }: MessageLimitReachedProps) {
  const { createCheckoutSession, billingData } = useBillingContext()
  
  // Don't show message limit reached if billing is disabled
  if (billingData && billingData.billing_enabled === false) {
    return null
  }
  
  const handleUpgrade = () => {
    createCheckoutSession()
  }

  const message = errorDetails?.message || "You've reached your 10 free message limit. Upgrade to Premium for unlimited messages!"
  const currentCount = errorDetails?.current_count || billingData?.message_count || 10
  const limit = errorDetails?.limit || 10

  return (
    <div className="bg-warm-50 border-2 border-earth-300 rounded-lg p-6 mx-4 my-4 max-w-[600px] mx-auto">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-warm-800 mb-3">
          Message Limit Reached
        </h3>
        
        {/* Message */}
        <p className="text-warm-700 mb-2">
          {message}
        </p>
        
        {/* Usage indicator */}
        <div className="text-sm text-warm-600 mb-6">
          Messages used: <span className="font-semibold">{currentCount}/{limit}</span>
        </div>
        
        {/* Upgrade button */}
        <button
          onClick={handleUpgrade}
          className="bg-earth-500 hover:bg-earth-600 text-warm-50 font-semibold py-3 px-8 rounded-lg transition-colors mb-3"
        >
          Upgrade to Premium - $5/week
        </button>

        
      </div>
    </div>
  )
}