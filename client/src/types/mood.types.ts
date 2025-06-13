// Re-export types from shared location for backward compatibility
export type {
  MoodEntry,
  MoodEntryCreate,
  MoodTrendData,
  MoodSummary,
  MoodContext
} from '../shared/types/api.types'

// Re-export constants from shared location for backward compatibility
export {
  MOOD_SCALE,
  DAILY_MOOD_OPTIONS,
  type DailyMoodOption
} from '../shared/constants/mood.constants'