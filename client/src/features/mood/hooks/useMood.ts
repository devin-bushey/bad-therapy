import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
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

type MutationContext = {
  previousMood: MoodEntry | null
}

export function useUpdateMood() {
  const moodApi = useMoodApi()
  const queryClient = useQueryClient()
  
  return useAuthenticatedMutation<MoodEntry, MoodEntryCreate>(
    (data) => moodApi.updateDailyMood(data),
    {
      onMutate: async (newMoodData): Promise<MutationContext> => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['mood', 'today'] })
        
        // Snapshot the previous value
        const previousMood = queryClient.getQueryData<MoodEntry | null>(['mood', 'today'])
        
        // Optimistically update to the new value
        const optimisticMood: MoodEntry = {
          id: previousMood?.id || 'temp-id',
          user_id: previousMood?.user_id || 'temp-user',
          mood_score: newMoodData.mood_score,
          mood_emoji: newMoodData.mood_emoji,
          created_at: previousMood?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        queryClient.setQueryData(['mood', 'today'], optimisticMood)
        
        // Return a context object with the snapshotted value
        return { previousMood: previousMood || null }
      },
      onSuccess: (newMood) => {
        queryClient.setQueryData(['mood', 'today'], newMood)
        queryClient.invalidateQueries({ queryKey: ['mood', 'trend'] })
        queryClient.invalidateQueries({ queryKey: ['mood', 'summary'] })
        // Invalidate the month view for MoodTrendChart
        const now = new Date()
        queryClient.invalidateQueries({ queryKey: ['mood', 'month', String(now.getFullYear()), String(now.getMonth())] })
      },
      onError: (error, _newMoodData, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        const typedContext = context as MutationContext | undefined
        if (typedContext?.previousMood) {
          queryClient.setQueryData(['mood', 'today'], typedContext.previousMood)
        }
        console.error('Failed to update mood:', error)
      },
      onSettled: () => {
        // Always refetch after error or success to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['mood', 'today'] })
      }
    }
  )
}

export function useIsNewDay() {
  const queryClient = useQueryClient()
  const currentDateRef = useRef(new Date().toDateString())
  
  useEffect(() => {
    const checkForNewDay = () => {
      const newDate = new Date().toDateString()
      if (currentDateRef.current !== newDate) {
        currentDateRef.current = newDate
        // Invalidate mood queries to refresh data for the new day
        queryClient.invalidateQueries({ queryKey: ['mood'] })
      }
    }
    
    // Check every minute
    const interval = setInterval(checkForNewDay, 60000)
    
    // Also check when the component mounts
    checkForNewDay()
    
    return () => clearInterval(interval)
  }, [queryClient])
  
  return currentDateRef.current
}