import { createContext } from 'react'
import { type UseBillingReturn } from '../hooks/useBilling'

// Use the complete billing interface
type BillingContextType = UseBillingReturn

export const BillingContext = createContext<BillingContextType | undefined>(undefined)