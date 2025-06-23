import { useContext } from 'react'
import { BillingContext } from '../contexts/BillingContextDefinition'

export function useBillingContext() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBillingContext must be used within a BillingProvider')
  }
  return context
}