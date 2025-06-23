import { ApiClient } from '../../../shared/services/apiClient'

export interface BillingData {
  message_count: number
  is_premium: boolean
  messages_remaining: number | null
  stripe_session_id?: string
  billing_enabled?: boolean
}

export interface BillingConfig {
  billingEnabled: boolean
}

export class BillingService {
  private config: BillingConfig
  private apiClient: ApiClient

  constructor(config: BillingConfig, apiClient: ApiClient) {
    this.config = config
    this.apiClient = apiClient
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

    return this.apiClient.get<BillingData>('/billing/usage')
  }

  // Create Stripe checkout session
  async createCheckoutSession(): Promise<string> {
    if (!this.isBillingEnabled()) {
      console.log('Billing is currently disabled. All features are free!')
      return ''
    }

    const response = await this.apiClient.post<{ url: string }>('/billing/create-checkout-session', {
      lookup_key: 'premium-plan'
    })
    
    return response.url
  }

  // Open billing portal
  async openBillingPortal(sessionId: string): Promise<string> {
    if (!this.isBillingEnabled()) {
      throw new Error('Billing is currently disabled. All features are free!')
    }

    if (!sessionId) {
      throw new Error('No session ID available for billing portal')
    }

    const response = await this.apiClient.post<{ url: string }>('/billing/create-portal-session', {
      session_id: sessionId
    })
    
    return response.url
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
export function createBillingService(apiClient: ApiClient): BillingService {
  const config: BillingConfig = {
    billingEnabled: import.meta.env.VITE_BILLING_ENABLED !== 'false'
  }

  return new BillingService(config, apiClient)
}