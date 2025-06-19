import { useApiClient } from '../../../shared/services/apiClient'
import type { DailyTip, ResourceLink } from '../../../shared/types/api.types'

export function useTipsApi() {
  const apiClient = useApiClient()

  return {
    getDailyTip: () => apiClient.get<DailyTip>('/tips/daily')
  }
}

// Re-export types for backward compatibility
export type { DailyTip, ResourceLink }