export interface BillingData {
  message_count: number
  is_premium: boolean
  messages_remaining: number | null
  stripe_session_id?: string
  billing_enabled?: boolean
}

export interface BillingConfig {
  apiUrl: string
  billingEnabled: boolean
}

export class BillingService {
  private config: BillingConfig
  private getAccessToken: () => Promise<string>

  constructor(config: BillingConfig, getAccessToken: () => Promise<string>) {
    this.config = config
    this.getAccessToken = getAccessToken
  }

  // Single source of truth for billing enabled check
  isBillingEnabled(): boolean {
    return this.config.billingEnabled
  }

  // Get mock premium data when billing is disabled
  getMockPremiumData(): BillingData {
    return {
      message_count: 0,
      is_premium: true,
      messages_remaining: null,
      billing_enabled: false
    }
  }

  // Get fallback data for errors
  getFallbackData(): BillingData {
    return {
      message_count: 0,
      is_premium: false,
      messages_remaining: 10,
      billing_enabled: true
    }
  }

  // Centralized API call for billing data
  async fetchBillingData(): Promise<BillingData> {
    // If billing is disabled, return premium data immediately
    if (!this.isBillingEnabled()) {
      return this.getMockPremiumData()
    }

    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.apiUrl}/billing/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch billing data: ${response.status}`)
    }

    return response.json()
  }

  // Create Stripe checkout session
  async createCheckoutSession(): Promise<string> {
    if (!this.isBillingEnabled()) {
      console.log('Billing is currently disabled. All features are free!')
      return ''
    }

    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.apiUrl}/billing/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lookup_key: 'premium-plan'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create checkout session: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.url
  }

  // Open billing portal
  async openBillingPortal(sessionId: string): Promise<string> {
    if (!this.isBillingEnabled()) {
      throw new Error('Billing is currently disabled. All features are free!')
    }

    if (!sessionId) {
      throw new Error('No session ID available for billing portal')
    }

    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.apiUrl}/billing/create-portal-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create billing portal session: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.url
  }

  // Check if user has reached message limit
  isMessageLimitReached(billingData: BillingData | null): boolean {
    if (!billingData || !this.isBillingEnabled()) {
      return false
    }

    return !billingData.is_premium && billingData.message_count >= 10
  }

  // Get display text for usage
  getUsageText(billingData: BillingData | null): string {
    if (!billingData || !this.isBillingEnabled()) {
      return 'Premium Plan Active'
    }

    if (billingData.is_premium) {
      return 'Premium Plan Active'
    }

    return `${billingData.message_count}/10 free messages used`
  }
}

// Factory function to create billing service
export function createBillingService(): BillingService {
  const config: BillingConfig = {
    apiUrl: import.meta.env.VITE_SERVER_DOMAIN,
    billingEnabled: import.meta.env.VITE_BILLING_ENABLED !== 'false'
  }

  // This will be set when the hook is used
  const getAccessToken = async () => {
    throw new Error('Access token getter not initialized')
  }

  return new BillingService(config, getAccessToken)
}