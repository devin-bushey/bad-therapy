import React, { useState } from 'react'
import { useTodayMood, useUpdateMood } from '../hooks/useMood'
import { DAILY_MOOD_OPTIONS } from '../../../types/mood.types'
import type { DailyMoodOption } from '../../../types/mood.types'

const DailyMoodTracker: React.FC = () => {
  const { data: todayMood, isLoading } = useTodayMood()
  const updateMood = useUpdateMood()
  const [selectedMood, setSelectedMood] = useState<DailyMoodOption | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleMoodSelect = async (moodOption: DailyMoodOption) => {
    setSelectedMood(moodOption)
    
    try {
      await updateMood.mutateAsync({
        mood_score: moodOption.score,
        mood_emoji: moodOption.emoji
      })
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save mood:', error)
      setSelectedMood(null)
    }
  }

  const getCurrentMoodOption = (): DailyMoodOption | null => {
    if (!todayMood) return null
    
    return DAILY_MOOD_OPTIONS.find(option => 
      todayMood.mood_score >= option.range[0] && 
      todayMood.mood_score <= option.range[1]
    ) || null
  }

  const currentMoodOption = getCurrentMoodOption()

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '120px',
          color: '#b3b3b3'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <h3 style={{ 
        fontWeight: 600, 
        marginBottom: '1rem',
        color: '#fff',
        fontSize: '18px'
      }}>
        How are you feeling today?
      </h3>
      
      {/* Success message */}
      {showSuccess && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: '#22c55e',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 10
        }}>
          Mood updated!
        </div>
      )}
      
      {/* Mood Options */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {DAILY_MOOD_OPTIONS.map((option) => {
          const isSelected = currentMoodOption?.score === option.score
          const isHovered = selectedMood?.score === option.score
          
          return (
            <button
              key={option.score}
              onClick={() => handleMoodSelect(option)}
              disabled={updateMood.isPending}
              style={{
                background: 'none',
                border: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                borderRadius: '12px',
                padding: '0.75rem',
                cursor: updateMood.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
                opacity: updateMood.isPending ? 0.7 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                minWidth: '70px'
              }}
              onMouseEnter={() => !updateMood.isPending && setSelectedMood(option)}
              onMouseLeave={() => !updateMood.isPending && setSelectedMood(null)}
            >
              <span style={{ 
                fontSize: '32px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                {option.emoji}
              </span>
              <span style={{ 
                fontSize: '11px', 
                color: '#b3b3b3',
                fontWeight: 500
              }}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Current mood display */}
      {todayMood && (
        <div style={{ 
          textAlign: 'center', 
          color: '#b3b3b3', 
          fontSize: '14px',
          marginTop: '0.5rem'
        }}>
          <span>Current: {todayMood.mood_emoji} {currentMoodOption?.label}</span>
          <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
            • Updated {new Date(todayMood.updated_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )}
      
      {/* No mood set message */}
      {!todayMood && !updateMood.isPending && (
        <div style={{ 
          textAlign: 'center', 
          color: '#888', 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          Select your mood to get started
        </div>
      )}
    </div>
  )
}

export default DailyMoodTracker