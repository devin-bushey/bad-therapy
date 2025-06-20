import { useAuth0 } from '@auth0/auth0-react'
import Loading from '../pages/Loading'
import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'

export default function ProtectedRoute(Component: ComponentType<object>) {
  return function ProtectedComponent(props: any) {
    const { isAuthenticated, isLoading, error, loginWithRedirect } = useAuth0()
    const [timeoutReached, setTimeoutReached] = useState(false)

    // Add timeout to prevent infinite loading
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setTimeoutReached(true)
        }
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }, [isLoading])

    // Handle authentication error or timeout
    if (error || timeoutReached) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">
              {error ? 'Authentication Error' : 'Loading Timeout'}
            </div>
            <div className="text-gray-300 mb-6">
              {error?.message || 'Authentication is taking too long. Please try again.'}
            </div>
            <button 
              onClick={() => loginWithRedirect()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    // Show loading while authenticating
    if (isLoading) {
      return <Loading />
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      loginWithRedirect()
      return <Loading />
    }

    // Render protected component
    return <Component {...props} />
  }
} 