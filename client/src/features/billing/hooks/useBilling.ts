import { useQuery } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useMemo } from 'react'
import { type BillingData, createBillingService } from '../services/BillingService'

export interface UseBillingReturn {
  billingData: BillingData | null
  loading: boolean
  error: string | null
  refetch: () => void
  isStale: boolean
  isFetching: boolean
  createCheckoutSession: () => Promise<void>
  openBillingPortal: (sessionId?: string) => Promise<void>
  isMessageLimitReached: boolean
  usageText: string
  isPremium: boolean
  messagesRemaining: number | null
}

export function useBilling(): UseBillingReturn {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  
  // Create billing service instance
  const billingService = useMemo(() => {
    const service = createBillingService()
    // Override the access token getter
    service['getAccessToken'] = getAccessTokenSilently
    return service
  }, [getAccessTokenSilently])

  // Optimized query with event-driven updates only
  const query = useQuery<BillingData>({
    queryKey: ['billing', 'usage'],
    queryFn: () => billingService.fetchBillingData(),
    enabled: isAuthenticated,
    // Remove auto-refresh intervals - use event-driven updates only
    refetchInterval: false,
    refetchIntervalInBackground: false,
    // Only refetch on window focus if data is stale (> 5 minutes)
    refetchOnWindowFocus: (query) => {
      const lastFetch = query.state.dataUpdatedAt
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      return lastFetch < fiveMinutesAgo
    },
    // Longer cache times for more stable data
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Provide fallback data for better UX during errors
  const billingData = query.data || (query.error ? billingService.getFallbackData() : null)

  // Memoized computed values
  const isMessageLimitReached = useMemo(() => 
    billingService.isMessageLimitReached(billingData), 
    [billingService, billingData]
  )

  const usageText = useMemo(() => 
    billingService.getUsageText(billingData), 
    [billingService, billingData]
  )

  const isPremium = useMemo(() => 
    billingData?.is_premium ?? false, 
    [billingData]
  )

  const messagesRemaining = useMemo(() => 
    billingData?.messages_remaining ?? null, 
    [billingData]
  )

  // Event-driven refetch function
  const refetch = useCallback(() => {
    query.refetch()
  }, [query])

  // Optimized checkout session creation
  const createCheckoutSession = useCallback(async () => {
    try {
      const url = await billingService.createCheckoutSession()
      if (url) {
        window.location.href = url
        // Refetch billing data after redirect (when user returns)
        setTimeout(() => refetch(), 1000)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    }
  }, [billingService, refetch])

  // Optimized billing portal opening
  const openBillingPortal = useCallback(async (sessionId?: string) => {
    try {
      const finalSessionId = sessionId || billingData?.stripe_session_id
      if (!finalSessionId) {
        alert('Please complete a subscription first to access billing management.')
        return
      }

      const url = await billingService.openBillingPortal(finalSessionId)
      window.open(url, '_blank')
      
      // Refetch billing data after portal interaction
      setTimeout(() => refetch(), 2000)
    } catch (error) {
      console.error('Error opening billing portal:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    }
  }, [billingService, billingData, refetch])

  return {
    billingData,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch,
    isStale: query.isStale,
    isFetching: query.isFetching,
    createCheckoutSession,
    openBillingPortal,
    isMessageLimitReached,
    usageText,
    isPremium,
    messagesRemaining,
  }
}