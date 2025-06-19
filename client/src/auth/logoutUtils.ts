// Utility functions for enhanced logout functionality

/**
 * Clear all cookies from the current domain and its parent domain
 */
export const clearAllCookies = () => {
  try {
    // Get all cookies
    const cookies = document.cookie.split(';')
    
    // Clear cookies for current domain and path combinations
    const clearCookieVariants = (name: string) => {
      const domains = [
        window.location.hostname,
        `.${window.location.hostname}`,
        `.${window.location.hostname.split('.').slice(-2).join('.')}`, // parent domain
        '.badtherapy.cool',
        '.onrender.com',
        'localhost',
        '127.0.0.1'
      ]
      
      const paths = ['/', '/dashboard', '/chat', '/user', '/journal']
      
      domains.forEach(domain => {
        paths.forEach(path => {
          // Clear with different combinations
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain};`
        })
      })
      
      // Also clear without domain/path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
    }
    
    // Clear each existing cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name) {
        clearCookieVariants(name)
      }
    })
    
    console.log('Cleared all cookies')
  } catch (error) {
    console.error('Error clearing cookies:', error)
  }
}

/**
 * Clear all localStorage data
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear()
    console.log('Cleared localStorage')
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Clear all sessionStorage data
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear()
    console.log('Cleared sessionStorage')
  } catch (error) {
    console.error('Error clearing sessionStorage:', error)
  }
}

/**
 * Clear Auth0-specific storage (more targeted approach)
 */
export const clearAuth0Storage = () => {
  try {
    // Clear Auth0 keys from localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('@@auth0spajs@@') || key.includes('auth0'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear Auth0 keys from sessionStorage
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.startsWith('@@auth0spajs@@') || key.includes('auth0'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

    console.log('Cleared Auth0 storage')
  } catch (error) {
    console.error('Error clearing Auth0 storage:', error)
  }
}

/**
 * Clear TanStack Query cache
 */
export const clearQueryCache = () => {
  try {
    // Clear any cached query data that might contain sensitive information
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.includes('query') || 
      key.includes('cache') || 
      key.includes('TANSTACK')
    )
    
    cacheKeys.forEach(key => localStorage.removeItem(key))
    console.log('Cleared query cache')
  } catch (error) {
    console.error('Error clearing query cache:', error)
  }
}

/**
 * Comprehensive logout cleanup function
 * @param clearAll - If true, clears ALL browser data. If false, only clears Auth0 data
 */
export const performLogoutCleanup = (clearAll: boolean = false) => {
  console.log('Performing logout cleanup...')
  
  if (clearAll) {
    // Nuclear option - clear everything
    clearAllCookies()
    clearLocalStorage()
    clearSessionStorage()
  } else {
    // Targeted cleanup - only Auth0 and query cache
    clearAuth0Storage()
    clearQueryCache()
    clearAllCookies() // Still clear all cookies as they might contain Auth0 data
  }
  
  console.log('Logout cleanup completed')
}