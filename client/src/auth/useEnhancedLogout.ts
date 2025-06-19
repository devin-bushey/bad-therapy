import { useAuth0 } from '@auth0/auth0-react'
import { clearAllCookies } from './logoutUtils'

interface LogoutOptions {
  returnTo?: string // Where to redirect after logout
}

export const useEnhancedLogout = () => {
  const { logout: auth0Logout } = useAuth0()

  const logout = (options: LogoutOptions = {}) => {
    const { returnTo = window.location.origin + '/' } = options

    try {
      console.log('Clearing cookies before Auth0 logout...')
      
      // Only clear cookies - let Auth0 handle its own storage
      clearAllCookies()
      
      console.log('Performing Auth0 logout...')
      
      // Perform standard Auth0 logout immediately
      auth0Logout({
        logoutParams: {
          returnTo
        }
      })
      
    } catch (error) {
      console.error('Error during logout:', error)
      
      // Fallback: perform Auth0 logout even if cookie clearing fails
      auth0Logout({
        logoutParams: {
          returnTo
        }
      })
    }
  }

  return { logout }
}