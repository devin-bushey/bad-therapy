import type { 
  MoodEntry, 
  MoodEntryCreate, 
  MoodTrendData, 
  MoodSummary 
} from '../../../types/mood.types'

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export const updateDailyMood = async (data: MoodEntryCreate, token: string): Promise<MoodEntry> => {
  const res = await fetch(`${API_URL}/mood/daily`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) {
    throw new Error('Failed to save mood entry')
  }
  
  return res.json()
}

export const fetchTodayMood = async (token: string): Promise<MoodEntry | null> => {
  const res = await fetch(`${API_URL}/mood/today`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch today\'s mood')
  }
  
  const data = await res.json()
  return data || null
}

export const fetchRecentMoods = async (token: string, days: number = 7): Promise<MoodEntry[]> => {
  const res = await fetch(`${API_URL}/mood/recent?days=${days}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch recent moods')
  }
  
  return res.json()
}

export const fetchMoodTrend = async (token: string, days: number = 7): Promise<MoodTrendData[]> => {
  const res = await fetch(`${API_URL}/mood/trend?days=${days}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch mood trend')
  }
  
  return res.json()
}

export const fetchMoodSummary = async (token: string): Promise<MoodSummary> => {
  const res = await fetch(`${API_URL}/mood/summary`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch mood summary')
  }
  
  return res.json()
}