import React from 'react'
import { useAuthenticatedQuery } from '../../../shared/hooks/useAuthenticatedQuery'
import { useMoodApi } from '../services/moodService'
import type { MoodEntry } from '../../../shared/types/api.types'

function getMonthDays(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: lastDay }, (_, i) => i + 1)
}

function getMoodColor(score?: number) {
  if (score == null) return 'bg-gray-400'
  if (score <= 2) return 'bg-red-500'
  if (score <= 4) return 'bg-orange-400'
  if (score <= 5) return 'bg-gray-400'
  if (score <= 7) return 'bg-green-400'
  return 'bg-green-600'
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
    const d = new Date(m.created_at).getDate()
    moodByDay[d] = m
  })
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const paddedDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...days
  ]
  return (
    <div className="card ">
      <div className="font-bold mb-4 text-white text-center">
        {now.toLocaleString('default', { month: 'long' })}
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-gray-400 text-center">
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