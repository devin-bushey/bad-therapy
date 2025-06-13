import { TIP_TYPE_STYLES, SOURCE_ICONS, CREDIBILITY_COLORS, getCredibilityLevel } from '../constants/tips.constants'
import type { DailyTip } from '../types/api.types'

export function getTipTypeInfo(type: DailyTip['type']) {
  return TIP_TYPE_STYLES[type] || TIP_TYPE_STYLES.prompt
}

export function getSourceIcon(sourceType: string) {
  const normalizedType = sourceType.toLowerCase() as keyof typeof SOURCE_ICONS
  return SOURCE_ICONS[normalizedType] || SOURCE_ICONS.article
}

export function getCredibilityColorClass(score?: number) {
  const level = getCredibilityLevel(score)
  return CREDIBILITY_COLORS[level]
}