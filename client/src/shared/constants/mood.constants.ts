// Mood scale configuration
export const MOOD_SCALE = [
  { score: 1, emoji: '😞', label: 'Sad', color: 'red-500' },
  { score: 2, emoji: '😞', label: 'Sad', color: 'red-500' },
  { score: 3, emoji: '😟', label: 'Worried', color: 'orange-500' },
  { score: 4, emoji: '😟', label: 'Worried', color: 'orange-500' },
  { score: 5, emoji: '😐', label: 'Neutral', color: 'gray-500' },
  { score: 6, emoji: '😐', label: 'Neutral', color: 'gray-500' },
  { score: 7, emoji: '😊', label: 'Happy', color: 'green-500' },
  { score: 8, emoji: '😊', label: 'Happy', color: 'green-500' },
  { score: 9, emoji: '😄', label: 'Excellent', color: 'green-600' },
  { score: 10, emoji: '😄', label: 'Excellent', color: 'green-600' }
] as const

// Simplified 5-emoji scale for daily tracking
export const DAILY_MOOD_OPTIONS = [
  { score: 2, emoji: '😞', label: 'Sad', range: [1, 2] },
  { score: 4, emoji: '😟', label: 'Worried', range: [3, 4] },
  { score: 5, emoji: '😐', label: 'Neutral', range: [5, 6] },
  { score: 7, emoji: '😊', label: 'Happy', range: [7, 8] },
  { score: 9, emoji: '😄', label: 'Excellent', range: [9, 10] }
] as const

export type DailyMoodOption = typeof DAILY_MOOD_OPTIONS[number]