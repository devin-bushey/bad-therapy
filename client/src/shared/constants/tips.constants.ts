export const TIP_TYPE_STYLES = {
  prompt: {
    label: 'CONVERSATION STARTER',
    badgeClass: 'bg-blue-500 text-blue-100',
    cardClass: 'bg-gray-800 border-gray-700 hover:border-blue-500'
  },
  info: {
    label: 'SELF-CARE TIP',
    badgeClass: 'bg-emerald-500 text-emerald-100',
    cardClass: 'bg-emerald-950 border-emerald-800 hover:border-emerald-500'
  },
  ai_guidance: {
    label: 'AI THERAPY TIP',
    badgeClass: 'bg-violet-500 text-violet-100',
    cardClass: 'bg-violet-950 border-violet-800 hover:border-violet-500'
  },
  resource: {
    label: 'HELPFUL RESOURCE',
    badgeClass: 'bg-amber-500 text-amber-100',
    cardClass: 'bg-amber-950 border-amber-800 hover:border-amber-500'
  }
} as const

export const SOURCE_ICONS = {
  article: '🔗',
  video: '🎥',
  app: '📱',
  exercise: '🏃‍♀️',
  crisis_support: '🆘'
} as const

export const CREDIBILITY_COLORS = {
  high: 'bg-emerald-500',
  medium: 'bg-yellow-500',
  low: 'bg-red-500',
  unknown: 'bg-gray-500'
} as const

export function getCredibilityLevel(score?: number): keyof typeof CREDIBILITY_COLORS {
  if (!score) return 'unknown'
  if (score >= 0.8) return 'high'
  if (score >= 0.6) return 'medium'
  return 'low'
}