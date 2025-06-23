import React from 'react'
import { useBilling } from '../hooks/useBilling'
import { BillingContext } from './BillingContextDefinition'

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const billing = useBilling()

  return (
    <BillingContext.Provider value={billing}>
      {children}
    </BillingContext.Provider>
  )
}