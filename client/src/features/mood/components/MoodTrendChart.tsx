import React from 'react'
import { useMoodTrend } from '../hooks/useMood'
import type { MoodTrendData } from '../../../types/mood.types'

const MoodTrendChart: React.FC = () => {
  const { data: trendData = [], isLoading } = useMoodTrend(7)

  const generateLinePath = (data: MoodTrendData[]): string => {
    if (data.length === 0) return ''
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 85 + 7.5 // 7.5% to 92.5%
      const y = 120 - (point.mood_score / 10) * 100 // Invert Y axis
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  const generateAreaPath = (data: MoodTrendData[]): string => {
    if (data.length === 0) return ''
    
    const linePath = generateLinePath(data)
    const firstX = 7.5
    const lastX = (data.length - 1) / (data.length - 1) * 85 + 7.5
    
    // Close the path at the bottom
    return `${linePath} L ${lastX},120 L ${firstX},120 Z`
  }

  if (isLoading) {
    return (
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
          Mood Trend (Last 7 Days)
        </h2>
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#b3b3b3'
        }}>
          Loading trend data...
        </div>
      </div>
    )
  }

  if (trendData.length === 0) {
    return (
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
          Mood Trend (Last 7 Days)
        </h2>
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#888',
          fontSize: '16px'
        }}>
          Start tracking your mood to see trends here
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h2 style={{ 
        fontWeight: 700, 
        marginBottom: '1.5rem',
        color: '#fff',
        fontSize: '20px'
      }}>
        Mood Trend (Last 7 Days)
      </h2>
      
      <div style={{ 
        height: '200px', 
        position: 'relative',
        background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.1), transparent)',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        {/* SVG Chart */}
        <svg 
          width="100%" 
          height="140" 
          style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem' }}
          viewBox="0 0 100 120"
          preserveAspectRatio="none"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path 
            d={generateAreaPath(trendData)} 
            fill="url(#moodGradient)" 
          />
          
          {/* Line */}
          <path 
            d={generateLinePath(trendData)} 
            stroke="#60a5fa" 
            strokeWidth="0.5" 
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Emoji points */}
        {trendData.map((point, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${(index / (trendData.length - 1)) * 85 + 7.5}%`,
              top: `${120 - (point.mood_score / 10) * 100 + 16}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              filter: point.has_entry 
                ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
                : 'grayscale(50%) opacity(0.6)',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
            }}
            title={point.has_entry 
              ? `${point.day}: ${point.mood_emoji} (${point.mood_score}/10)` 
              : `${point.day}: No mood logged`
            }
          >
            {point.mood_emoji}
          </div>
        ))}
        
        {/* Day labels */}
        <div style={{ 
          position: 'absolute', 
          bottom: '8px', 
          left: '1rem',
          right: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: '7.5%',
          paddingRight: '7.5%'
        }}>
          {trendData.map((point, index) => (
            <span 
              key={index}
              style={{ 
                fontSize: '12px', 
                color: '#b3b3b3',
                fontWeight: 500,
                textAlign: 'center',
                minWidth: '30px'
              }}
            >
              {point.day}
            </span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '1rem',
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#888'
        }}>
          <span>😄</span>
          <span>😊</span>
          <span>😐</span>
          <span>😟</span>
          <span>😞</span>
        </div>
      </div>
      
      {/* Summary stats */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#b3b3b3'
      }}>
        <span>
          Avg: {(trendData.filter(d => d.has_entry).reduce((sum, d) => sum + d.mood_score, 0) / 
                 Math.max(1, trendData.filter(d => d.has_entry).length)).toFixed(1)}/10
        </span>
        <span>
          {trendData.filter(d => d.has_entry).length} of 7 days logged
        </span>
      </div>
    </div>
  )
}

export default MoodTrendChart