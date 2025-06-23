import { useEffect } from 'react'
import { CheckoutSuccessMessage } from './CheckoutSuccessMessage'
import { CheckoutCancelledMessage } from './CheckoutCancelledMessage'
import { useCheckoutStatus, type CheckoutStatus } from '../hooks/useCheckoutStatus'

interface CheckoutStatusHandlerProps {
  onStatusChange?: (status: CheckoutStatus, sessionId?: string) => void
}

export function CheckoutStatusHandler({ onStatusChange }: CheckoutStatusHandlerProps) {
  const { checkoutStatus, sessionId, dismissStatus } = useCheckoutStatus()

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(checkoutStatus, sessionId || undefined)
    }
  }, [checkoutStatus, sessionId, onStatusChange])

  if (checkoutStatus === 'success') {
    return (
      <CheckoutSuccessMessage 
        sessionId={sessionId} 
        onDismiss={dismissStatus}
      />
    )
  }

  if (checkoutStatus === 'canceled') {
    return (
      <CheckoutCancelledMessage 
        onDismiss={dismissStatus}
      />
    )
  }

  return null
}