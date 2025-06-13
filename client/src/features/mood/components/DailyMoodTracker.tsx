import React, { useState } from 'react'
import { useTodayMood, useUpdateMood } from '../hooks/useMood'
import { DAILY_MOOD_OPTIONS } from '../../../shared/constants/mood.constants'
import { getCurrentMoodOption } from '../../../shared/utils/moodHelpers'
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner'
import { SuccessToast } from '../../../shared/components/ui/SuccessToast'
import { cn } from '../../../shared/utils/cn'
import type { DailyMoodOption } from '../../../shared/constants/mood.constants'

const DailyMoodTracker: React.FC = () => {
  const { data: todayMood, isLoading } = useTodayMood()
  const updateMood = useUpdateMood()
  const [, setSelectedMood] = useState<DailyMoodOption | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleMoodSelect = async (moodOption: DailyMoodOption) => {
    setSelectedMood(moodOption)
    
    try {
      await updateMood.mutateAsync({
        mood_score: moodOption.score,
        mood_emoji: moodOption.emoji
      })
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save mood:', error)
      setSelectedMood(null)
    }
  }

  const currentMoodOption = getCurrentMoodOption(todayMood || null)

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center h-[120px] text-gray-400">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="card relative">
      <h3 className="text-lg font-semibold pb-4 text-white">
        How are you feeling today?
      </h3>
      
      {showSuccess && (
        <SuccessToast message="Mood updated!" />
      )}
      
      <div className="flex justify-between max-sm:justify-center gap-6 mb-4 max-sm:gap-3 max-xs:gap-2 max-sm:px-0 px-2">
        {DAILY_MOOD_OPTIONS.map((option) => {
          const isSelected = currentMoodOption?.score === option.score

          return (
            <button
              key={option.score}
              onClick={() => handleMoodSelect(option)}
              disabled={updateMood.isPending}
              className={cn(
                "group flex flex-col items-center bg-transparent outline-none border-none p-0 m-0 appearance-none focus:outline-none transition-all duration-200",
                updateMood.isPending && "opacity-70 cursor-not-allowed"
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              onMouseEnter={() => !updateMood.isPending && setSelectedMood(option)}
              onMouseLeave={() => !updateMood.isPending && setSelectedMood(null)}
            >
              <span
                className={cn(
                  "block w-12 h-12 rounded-full transition-all duration-200 shadow-md",
                  option.score <= 2 ? "bg-red-500" :
                  option.score <= 4 ? "bg-orange-400" :
                  option.score <= 5 ? "bg-gray-400" :
                  option.score <= 7 ? "bg-green-400" :
                  "bg-green-600",
                  isSelected && "scale-110 shadow-2xl ring-4 ring-opacity-40 ring-blue-400",
                  !isSelected && "group-hover:scale-105 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-opacity-30 group-hover:ring-emerald-300"
                )}
              />
              <span className="text-[11px] text-gray-400 font-medium text-center mt-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200" style={{letterSpacing: 0.2}}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {todayMood && (
        <div className="text-center text-gray-400 text-sm mt-2">
          <span>Current: {currentMoodOption && (
            <span className={cn(
              "inline-block w-3 h-3 rounded-full align-middle ml-1 mr-1",
              currentMoodOption.score <= 2 ? "bg-red-500" :
              currentMoodOption.score <= 4 ? "bg-orange-400" :
              currentMoodOption.score <= 5 ? "bg-gray-400" :
              currentMoodOption.score <= 7 ? "bg-green-400" :
              "bg-green-600"
            )} />
          )} {currentMoodOption?.label}</span>
          <span className="ml-2 opacity-70">
            • Updated {new Date(todayMood.updated_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )}
    </div>
  )
}

export default DailyMoodTracker