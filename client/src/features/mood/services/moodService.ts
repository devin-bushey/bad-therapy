import { useApiClient } from '../../../shared/services/apiClient'
import type { 
  MoodEntry, 
  MoodEntryCreate, 
  MoodTrendData, 
  MoodSummary 
} from '../../../shared/types/api.types'

export function useMoodApi() {
  const apiClient = useApiClient()

  return {
    getTodayMood: () => apiClient.get<MoodEntry | null>('/mood/today'),
    updateDailyMood: (data: MoodEntryCreate) => apiClient.put<MoodEntry>('/mood/daily', data),
    getRecentMoods: (days: number = 7) => apiClient.get<MoodEntry[]>(`/mood/recent?days=${days}`),
    getMoodTrend: (days: number = 7) => apiClient.get<MoodTrendData[]>(`/mood/trend?days=${days}`),
    getMoodSummary: () => apiClient.get<MoodSummary>('/mood/summary')
  }
}