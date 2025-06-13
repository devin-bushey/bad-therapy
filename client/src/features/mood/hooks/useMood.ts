import { useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedQuery } from '../../../shared/hooks/useAuthenticatedQuery'
import { useAuthenticatedMutation } from '../../../shared/hooks/useAuthenticatedMutation'
import { useMoodApi } from '../services/moodService'
import type { 
  MoodEntry, 
  MoodEntryCreate, 
  MoodTrendData, 
  MoodSummary 
} from '../../../shared/types/api.types'

export function useTodayMood() {
  const moodApi = useMoodApi()
  
  return useAuthenticatedQuery<MoodEntry | null>(
    ['mood', 'today'],
    () => moodApi.getTodayMood()
  )
}

export function useMoodTrend(days: number = 7) {
  const moodApi = useMoodApi()
  
  return useAuthenticatedQuery<MoodTrendData[]>(
    ['mood', 'trend', String(days)],
    () => moodApi.getMoodTrend(days)
  )
}

export function useMoodSummary() {
  const moodApi = useMoodApi()
  
  return useAuthenticatedQuery<MoodSummary>(
    ['mood', 'summary'],
    () => moodApi.getMoodSummary()
  )
}

export function useUpdateMood() {
  const moodApi = useMoodApi()
  const queryClient = useQueryClient()
  
  return useAuthenticatedMutation<MoodEntry, MoodEntryCreate>(
    (data) => moodApi.updateDailyMood(data),
    {
      onSuccess: (newMood) => {
        queryClient.setQueryData(['mood', 'today'], newMood)
        queryClient.invalidateQueries({ queryKey: ['mood', 'trend'] })
        queryClient.invalidateQueries({ queryKey: ['mood', 'summary'] })
      },
      onError: (error) => {
        console.error('Failed to update mood:', error)
      }
    }
  )
}