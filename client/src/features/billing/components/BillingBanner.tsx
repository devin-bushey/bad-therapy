import { useBillingContext } from '../hooks/useBillingContext'
import { BillingLoadingSkeleton } from './BillingLoadingSkeleton'

interface BillingBannerProps {
  className?: string
  size?: 'default' | 'compact'
}

export function BillingBanner({ className = "mb-8", size = 'default' }: BillingBannerProps) {
  const { 
    billingData, 
    loading: billingLoading, 
    createCheckoutSession, 
    openBillingPortal,
    usageText,
    isPremium,
    isCreatingCheckout,
    isOpeningPortal
  } = useBillingContext()

  // Show loading skeleton while data is loading
  if (billingLoading) {
    return <BillingLoadingSkeleton className={className} />
  }

  // Don't render anything if billing is disabled
  if (!billingData || billingData.billing_enabled === false) {
    return null
  }

  const compactMode = size === 'compact'

  return (
    <section className={className}>
      {isPremium ? (
        // Premium Status Banner
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-green-800 font-medium ${compactMode ? 'text-xs' : 'text-sm'}`}>
                ✨ {usageText}
              </p>
              <p className={`text-green-600 ${compactMode ? 'text-xs' : 'text-xs'}`}>
                Unlimited messages • $5/week
              </p>
            </div>
            <button
              onClick={() => openBillingPortal()}
              disabled={isOpeningPortal}
              className={`text-green-600 hover:text-green-800 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${compactMode ? 'text-xs' : 'text-xs'}`}
            >
              {isOpeningPortal ? 'Loading...' : 'Manage'}
            </button>
          </div>
        </div>
      ) : (
        // Free Trial Banner
        <div className="bg-warm-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-warm-800 ${compactMode ? 'text-xs' : 'text-sm'}`}>
                {usageText}
              </p>
              <p className={`text-warm-600 ${compactMode ? 'text-xs' : 'text-xs'}`}>
                Upgrade for unlimited • $5/week
              </p>
            </div>
            <button 
              onClick={createCheckoutSession}
              disabled={isCreatingCheckout}
              className={`bg-earth-500 text-warm-50 rounded font-medium hover:bg-earth-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-earth-500 ${
                compactMode 
                  ? 'px-2 py-1 text-xs' 
                  : 'px-3 py-1.5 text-xs'
              }`}
            >
              {isCreatingCheckout ? 'Loading...' : 'Upgrade'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}