import React, { createContext, useContext } from 'react'
import { useBilling, type UseBillingReturn } from '../hooks/useBilling'

// Re-export the billing data type for convenience
export type { BillingData } from '../services/BillingService'

// Use the complete billing interface
type BillingContextType = UseBillingReturn

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