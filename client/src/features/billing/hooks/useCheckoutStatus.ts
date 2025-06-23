import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type CheckoutStatus = 'success' | 'canceled' | null

export function useCheckoutStatus() {
  const [searchParams] = useSearchParams()
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const stripeSessionId = searchParams.get('session_id')

    if (success === 'true' && stripeSessionId) {
      setCheckoutStatus('success')
      setSessionId(stripeSessionId)
      // Clear URL params after processing
      window.history.replaceState({}, '', window.location.pathname)
    } else if (canceled === 'true') {
      setCheckoutStatus('canceled')
      setSessionId(null)
      // Clear URL params after processing  
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const dismissStatus = () => {
    setCheckoutStatus(null)
    setSessionId(null)
  }

  return {
    checkoutStatus,
    sessionId,
    dismissStatus
  }
}