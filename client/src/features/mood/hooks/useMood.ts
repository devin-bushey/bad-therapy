import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { 
  updateDailyMood, 
  fetchTodayMood, 
  fetchMoodTrend, 
  fetchMoodSummary 
} from '../services/moodService'
import type { 
  MoodEntry, 
  MoodEntryCreate, 
  MoodTrendData, 
  MoodSummary 
} from '../../../types/mood.types'

export function useTodayMood() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  
  return useQuery<MoodEntry | null>({
    queryKey: ['mood', 'today'],
    queryFn: async () => {
      if (!isAuthenticated) return null
      const token = await getAccessTokenSilently()
      return fetchTodayMood(token)
    },
    enabled: isAuthenticated
  })
}

export function useMoodTrend(days: number = 7) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  
  return useQuery<MoodTrendData[]>({
    queryKey: ['mood', 'trend', days],
    queryFn: async () => {
      if (!isAuthenticated) return []
      const token = await getAccessTokenSilently()
      return fetchMoodTrend(token, days)
    },
    enabled: isAuthenticated
  })
}

export function useMoodSummary() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  
  return useQuery<MoodSummary>({
    queryKey: ['mood', 'summary'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return {
          total_entries: 0,
          streak_days: 0
        }
      }
      const token = await getAccessTokenSilently()
      return fetchMoodSummary(token)
    },
    enabled: isAuthenticated
  })
}

export function useUpdateMood() {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: MoodEntryCreate) => {
      const token = await getAccessTokenSilently()
      return updateDailyMood(data, token)
    },
    onSuccess: (newMood) => {
      // Update today's mood in cache
      queryClient.setQueryData(['mood', 'today'], newMood)
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['mood', 'trend'] })
      queryClient.invalidateQueries({ queryKey: ['mood', 'summary'] })
    },
    onError: (error) => {
      console.error('Failed to update mood:', error)
    }
  })
}