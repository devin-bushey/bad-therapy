import React from 'react'
import { useAuthenticatedQuery } from '../../../shared/hooks/useAuthenticatedQuery'
import { useMoodApi } from '../services/moodService'
import { extractLocalDayFromUtc, extractLocalMonthFromUtc, extractLocalYearFromUtc } from '../../../shared/utils/timeUtils'
import type { MoodEntry } from '../../../shared/types/api.types'

function getMonthDays(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: lastDay }, (_, i) => i + 1)
}

function getMoodColor(score?: number) {
  if (score == null) return 'bg-warm-300'
  if (score <= 2) return 'bg-mood-negative'
  if (score <= 4) return 'bg-warning-500'
  if (score <= 5) return 'bg-mood-neutral'
  if (score <= 7) return 'bg-mood-positive'
  return 'bg-success-500'
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MoodTrendChart: React.FC = () => {
  const moodApi = useMoodApi()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const days = getMonthDays(year, month)
  const { data: moods = [] } = useAuthenticatedQuery<MoodEntry[]>(
    ['mood', 'month', String(year), String(month)],
    () => moodApi.getRecentMoods(40)
  )
  const moodByDay: Record<number, MoodEntry> = {}
  
  moods.forEach(m => {
    // Convert UTC timestamp to local time and extract day number
    const localDay = extractLocalDayFromUtc(m.updated_at)
    const localMonth = extractLocalMonthFromUtc(m.updated_at)
    const localYear = extractLocalYearFromUtc(m.updated_at)
    
    // Only include moods from the current month/year being displayed
    if (localYear === year && localMonth === month) {
      moodByDay[localDay] = m
    }
  })
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const paddedDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...days
  ]
  
  return (
    <div className="bg-warm-100 rounded-2xl shadow-lg p-8 mb-10 border border-warm-200">
      <div className="font-bold mb-4 text-warm-800 text-center">
        {now.toLocaleString('default', { month: 'long' })}
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-warm-600 text-center">
        {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 justify-items-center">
        {paddedDays.map((day, i) =>
          day ? (
            <div key={i} className={`w-4 h-4 rounded-full ${getMoodColor(moodByDay[day]?.mood_score)}`}></div>
          ) : (
            <div key={i}></div>
          )
        )}
      </div>
    </div>
  )
}

export default MoodTrendChart