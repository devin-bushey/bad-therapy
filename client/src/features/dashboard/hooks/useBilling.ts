import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface BillingData {
  message_count: number
  is_premium: boolean
  messages_remaining: number | null
  stripe_session_id?: string
}

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export function useBilling() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingData = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      
      const response = await fetch(`${API_URL}/billing/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch billing data: ${response.status}`)
      }

      const data = await response.json()
      setBillingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Set default billing data for free users when API fails
      setBillingData({
        message_count: 0,
        is_premium: false,
        messages_remaining: 10
      })
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async () => {
    try {
      const token = await getAccessTokenSilently()
      console.log('Creating checkout session with token:', token ? 'present' : 'missing')
      console.log('API URL:', API_URL)
      
      const response = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lookup_key: 'premium-plan'
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        throw new Error(`Failed to create checkout session: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Checkout session data:', data)
      window.location.href = data.url // Redirect to Stripe Checkout
    } catch (err) {
      console.error('Error creating checkout session:', err)
      alert(`Error: ${err.message}`) // Show user the error
    }
  }

  const openBillingPortal = async (sessionId?: string) => {
    try {
      const token = await getAccessTokenSilently()
      console.log('Opening billing portal with sessionId:', sessionId)
      console.log('billingData:', billingData)
      
      if (!sessionId) {
        console.error('No session ID available for billing portal')
        alert('Please complete a subscription first to access billing management.')
        return
      }

      const response = await fetch(`${API_URL}/billing/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      console.log('Portal response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Portal error response:', errorText)
        throw new Error(`Failed to create billing portal session: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Portal data:', data)
      window.open(data.url, '_blank')
    } catch (err) {
      console.error('Error opening billing portal:', err)
      alert(`Error: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [isAuthenticated])

  // Auto-refresh billing data every 30 seconds when user is active
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      fetchBillingData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return {
    billingData,
    loading,
    error,
    refetch: fetchBillingData,
    createCheckoutSession,
    openBillingPortal
  }
}