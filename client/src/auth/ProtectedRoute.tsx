import { withAuthenticationRequired } from '@auth0/auth0-react'
import Loading from '../pages/Loading'
import type { ComponentType } from 'react'

export default function ProtectedRoute(Component: ComponentType<object>) {
  return withAuthenticationRequired(Component, { onRedirecting: () => <Loading /> })
} 