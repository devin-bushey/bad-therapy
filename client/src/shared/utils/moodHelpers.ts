import { DAILY_MOOD_OPTIONS, type DailyMoodOption } from '../constants/mood.constants'
import type { MoodEntry } from '../types/api.types'

export function getCurrentMoodOption(todayMood: MoodEntry | null): DailyMoodOption | null {
  if (!todayMood) return null
  
  return DAILY_MOOD_OPTIONS.find(option => 
    todayMood.mood_score >= option.range[0] && 
    todayMood.mood_score <= option.range[1]
  ) || null
}