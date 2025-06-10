export type MoodEntry = {
  id: string
  user_id: string
  mood_score: number
  mood_emoji: string
  created_at: string
  updated_at: string
}

export type MoodEntryCreate = {
  mood_score: number
  mood_emoji: string
}

export type MoodTrendData = {
  date: string
  day: string
  mood_score: number
  mood_emoji: string
  has_entry: boolean
}

export type MoodSummary = {
  current_mood?: MoodEntry
  recent_average?: number
  trend_direction?: 'improving' | 'declining' | 'stable'
  total_entries: number
  streak_days: number
}

export type MoodContext = {
  today_mood?: MoodEntry
  recent_trend: MoodEntry[]
  mood_summary: string
  pattern_analysis: string
}

// Mood scale configuration
export const MOOD_SCALE = [
  { score: 1, emoji: '😞', label: 'Very Sad', color: '#ef4444' },
  { score: 2, emoji: '😞', label: 'Very Sad', color: '#ef4444' },
  { score: 3, emoji: '😟', label: 'Worried', color: '#f97316' },
  { score: 4, emoji: '😟', label: 'Worried', color: '#f97316' },
  { score: 5, emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { score: 6, emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { score: 7, emoji: '😊', label: 'Happy', color: '#22c55e' },
  { score: 8, emoji: '😊', label: 'Happy', color: '#22c55e' },
  { score: 9, emoji: '😄', label: 'Excellent', color: '#16a34a' },
  { score: 10, emoji: '😄', label: 'Excellent', color: '#16a34a' }
] as const

// Simplified 5-emoji scale for daily tracking
export const DAILY_MOOD_OPTIONS = [
  { score: 2, emoji: '😞', label: 'Very Sad', range: [1, 2] },
  { score: 4, emoji: '😟', label: 'Worried', range: [3, 4] },
  { score: 5, emoji: '😐', label: 'Neutral', range: [5, 6] },
  { score: 7, emoji: '😊', label: 'Happy', range: [7, 8] },
  { score: 9, emoji: '😄', label: 'Excellent', range: [9, 10] }
] as const

export type DailyMoodOption = typeof DAILY_MOOD_OPTIONS[number]