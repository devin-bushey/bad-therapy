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
    getTodayMood: () => {
      // Send user's local date to ensure we get the correct "today" mood
      const localDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      return apiClient.get<MoodEntry | null>(`/mood/today?date=${localDate}`)
    },
    updateDailyMood: (data: MoodEntryCreate) => {
      // Send user's local date to ensure we update the correct day's mood
      const localDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      return apiClient.put<MoodEntry>(`/mood/daily?date=${localDate}`, data)
    },
    getRecentMoods: (days: number = 7) => apiClient.get<MoodEntry[]>(`/mood/recent?days=${days}`),
    getMoodTrend: (days: number = 7) => apiClient.get<MoodTrendData[]>(`/mood/trend?days=${days}`),
    getMoodSummary: () => apiClient.get<MoodSummary>('/mood/summary')
  }
}