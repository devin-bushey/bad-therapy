// Mood Types
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

// Tips Types
export interface ResourceLink {
  url: string
  title: string
  description?: string
  source_type: string
  credibility_score?: number
}

export interface DailyTip {
  content: string
  type: 'prompt' | 'info' | 'ai_guidance' | 'resource'
  link?: ResourceLink
  follow_up_prompts?: string[]
  technique_category?: string
  confidence_score?: number
}