import React, { useState } from 'react'
import { useTodayMood, useUpdateMood, useIsNewDay } from '../hooks/useMood'
import { DAILY_MOOD_OPTIONS } from '../../../shared/constants/mood.constants'
import { getCurrentMoodOption } from '../../../shared/utils/moodHelpers'
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner'
import { SuccessToast } from '../../../shared/components/ui/SuccessToast'
import { cn } from '../../../shared/utils/cn'
import { formatTimeForDisplay } from '../../../shared/utils/timeUtils'
import type { DailyMoodOption } from '../../../shared/constants/mood.constants'

const DailyMoodTracker: React.FC = () => {
  const { data: todayMood, isLoading } = useTodayMood()
  const updateMood = useUpdateMood()
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Enable daily reset functionality
  useIsNewDay()  

  const handleMoodSelect = async (moodOption: DailyMoodOption) => {
    try {
      await updateMood.mutateAsync({
        mood_score: moodOption.score,
        mood_emoji: moodOption.emoji
      })
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save mood:', error)
    }
  }

  // Show saved mood from backend
  const currentMoodOption = getCurrentMoodOption(todayMood || null)

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 mb-10 border border-gray-700">
        <div className="flex justify-center items-center h-[120px] text-gray-400">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-8 mb-10 border border-gray-700 relative">
      <h3 className="text-lg font-semibold pb-4 text-white">
        How are you feeling today?
      </h3>
      
      {showSuccess && (
        <SuccessToast message="Mood updated!" />
      )}
      
      <div className="flex justify-between max-sm:justify-center gap-6 mb-4 max-sm:gap-3 max-xs:gap-2 max-sm:px-0 px-2">
        {DAILY_MOOD_OPTIONS.map((option) => {
          const isSelected = currentMoodOption?.score === option.score
          const isPending = updateMood.isPending

          return (
            <button
              key={option.score}
              onClick={() => handleMoodSelect(option)}
              disabled={updateMood.isPending}
              className={cn(
                "group flex flex-col items-center bg-transparent outline-none border-none p-0 m-0 appearance-none focus:outline-none transition-all duration-200",
                updateMood.isPending && !isPending && "opacity-50 cursor-not-allowed",
                isPending && "opacity-80"
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span
                className={cn(
                  "block w-12 h-12 rounded-full transition-all duration-200 shadow-md",
                  option.score <= 2 ? "bg-red-500" :
                  option.score <= 4 ? "bg-orange-400" :
                  option.score <= 5 ? "bg-gray-400" :
                  option.score <= 7 ? "bg-green-400" :
                  "bg-green-600",
                  isSelected && !isPending && "scale-110 shadow-2xl ring-4 ring-opacity-40 ring-blue-400",
                  isPending && "scale-105 ring-2 ring-opacity-50 ring-blue-300 animate-pulse",
                )}
              />
              <span className="text-[11px] text-gray-400 font-medium text-center mt-2 opacity-70 transition-opacity duration-200" style={{letterSpacing: 0.2}}>
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
            • Updated {formatTimeForDisplay(todayMood.updated_at)}
          </span>
        </div>
      )}
    </div>
  )
}

export default DailyMoodTracker