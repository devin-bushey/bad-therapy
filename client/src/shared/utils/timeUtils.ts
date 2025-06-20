/**
 * Centralized time utilities for consistent timezone handling
 * Handles conversion between UTC timestamps from backend and local browser time
 */

/**
 * Convert UTC timestamp string to local Date object
 * @param utcString - UTC timestamp string from backend (e.g., "2024-01-15T14:30:00Z")
 * @returns Local Date object
 */
export function convertUtcToLocal(utcString: string): Date {
  // Handle PostgreSQL timestamp format with microseconds
  // Convert "2025-06-19T22:11:24.252439+00" to "2025-06-19T22:11:24.252Z"
  const cleanedTimestamp = utcString
    .replace(/(\.\d{3})\d+/, '$1') // Remove extra microseconds, keep only 3 digits
    .replace(/\+00$/, 'Z')        // Convert +00 to Z
    .replace(/\+00:00$/, 'Z')     // Convert +00:00 to Z (just in case)
  
  return new Date(cleanedTimestamp)
}

/**
 * Get current local date in YYYY-MM-DD format
 * This ensures the frontend sends the correct local date to the backend
 * @returns Local date string in YYYY-MM-DD format
 */
export function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format UTC timestamp for user display in local time
 * @param utcString - UTC timestamp string from backend
 * @returns Formatted time string for display (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(utcString: string): string {
  const localDate = convertUtcToLocal(utcString)
  return localDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

/**
 * Extract the local day number from a UTC timestamp
 * This handles timezone conversion to ensure the correct day is used
 * @param utcString - UTC timestamp string from backend
 * @returns Day number (1-31) in user's local timezone
 */
export function extractLocalDayFromUtc(utcString: string): number {
  const localDate = convertUtcToLocal(utcString)
  return localDate.getDate()
}

/**
 * Extract the local month from a UTC timestamp
 * @param utcString - UTC timestamp string from backend
 * @returns Month number (0-11) in user's local timezone
 */
export function extractLocalMonthFromUtc(utcString: string): number {
  const localDate = convertUtcToLocal(utcString)
  return localDate.getMonth()
}

/**
 * Extract the local year from a UTC timestamp
 * @param utcString - UTC timestamp string from backend
 * @returns Year number in user's local timezone
 */
export function extractLocalYearFromUtc(utcString: string): number {
  const localDate = convertUtcToLocal(utcString)
  return localDate.getFullYear()
}

/**
 * Check if a UTC timestamp is from today in the user's local timezone
 * @param utcString - UTC timestamp string from backend
 * @returns True if the timestamp is from today in local time
 */
export function isFromToday(utcString: string): boolean {
  const localDate = convertUtcToLocal(utcString)
  const today = new Date()
  
  return localDate.getDate() === today.getDate() &&
         localDate.getMonth() === today.getMonth() &&
         localDate.getFullYear() === today.getFullYear()
}

