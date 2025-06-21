import React, { createContext, useContext } from 'react'
import { useBilling } from '../features/dashboard/hooks/useBilling'

interface BillingContextType {
  billingData: any
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCheckoutSession: () => Promise<void>
  openBillingPortal: (sessionId?: string) => Promise<void>
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const billing = useBilling()

  return (
    <BillingContext.Provider value={billing}>
      {children}
    </BillingContext.Provider>
  )
}

export function useBillingContext() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBillingContext must be used within a BillingProvider')
  }
  return context
}