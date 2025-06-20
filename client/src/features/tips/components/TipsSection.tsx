import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useTips } from '../hooks/useTips'
import { createSession } from '../../dashboard/services/sessionServices'
import { getTipTypeInfo, getSourceIcon, getCredibilityColorClass } from '../../../shared/utils/tipHelpers'
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner'
import { cn } from '../../../shared/utils/cn'
import type { DailyTip, ResourceLink } from '../../../shared/types/api.types'

function ResourceLinkCard({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3 p-3 bg-warm-200 border border-warm-300 rounded-lg no-underline text-inherit transition-all duration-200 hover:border-earth-500 hover:-translate-y-px"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{getSourceIcon(link.source_type)}</span>
        <span className="text-sm font-semibold text-warm-800 flex-1">
          {link.title}
        </span>
        {link.credibility_score && (
          <div className={cn('w-2 h-2 rounded-full', getCredibilityColorClass(link.credibility_score))} />
        )}
      </div>
      {link.description && (
        <p className="text-xs text-warm-600 m-0 leading-snug">
          {link.description}
        </p>
      )}
      <div className="text-xs text-warm-500 mt-1 capitalize">
        {link.source_type.replace('_', ' ')}
      </div>
    </a>
  )
}

export function TipsSection() {
  const { tip, loading, error } = useTips()
  const { getAccessTokenSilently, user } = useAuth0()
  const navigate = useNavigate()

  const handleTipClick = async (tip: DailyTip) => {
    if (tip.type !== 'prompt') return
    
    try {
      const token = await getAccessTokenSilently()
      if (!user || !user.sub) return
      
      const session = await createSession(token, `${tip.content.slice(0, 40)}...`, user.sub)
      navigate(`/chat?sessionId=${session.id}&initialPrompt=${encodeURIComponent(tip.content)}`)
    } catch (error) {
      console.error('Failed to create session from tip:', error)
    }
  }

  if (loading) {
    return (
      <section>
        <h2 className="font-bold mb-3 text-warm-800">Daily Tip</h2>
        <div className="bg-warm-100 rounded-2xl shadow-lg border border-warm-200 p-8 min-h-[80px] flex items-center mb-10">
          <div className="flex items-center gap-3 text-warm-600">
            <LoadingSpinner size="sm" />
            Loading your daily tip...
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2 className="font-bold mb-3 text-warm-800">Daily Tip</h2>
        <div className="bg-warm-100 rounded-2xl shadow-lg border border-warm-200 p-8 min-h-[80px] flex items-center mb-10">
          <div className="text-warm-600">Unable to load tip. Try refreshing the page.</div>
        </div>
      </section>
    )
  }

  if (!tip) {
    return null
  }

  const isClickable = tip.type === 'prompt'
  const typeInfo = getTipTypeInfo(tip.type)

  return (
    <section>
      <h2 className="font-bold mb-2 text-lg text-warm-800">Daily Tip</h2>
      <div 
        className={cn(
          'bg-warm-100 border border-warm-200 rounded-2xl shadow-lg p-8 min-h-[60px] transition-all duration-200 mb-10',
          isClickable 
            ? 'cursor-pointer hover:border-earth-500 hover:-translate-y-px'
            : 'cursor-default'
        )}
        onClick={() => isClickable && handleTipClick(tip)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide', typeInfo.badgeClass)}>
            {typeInfo.label}
          </span>
          {tip.technique_category && tip.technique_category !== 'general' && (
            <span className="text-[10px] text-warm-600 bg-warm-200 px-1 py-0.5 rounded uppercase ml-1">
              {tip.technique_category}
            </span>
          )}
          {isClickable && (
            <span className="text-[10px] text-warm-500 italic ml-auto">
              Click to start session
            </span>
          )}
        </div>
        <div className="leading-relaxed text-warm-800 text-base mb-1">
          {tip.content}
        </div>
        {tip.link && <ResourceLinkCard link={tip.link} />}
        {tip.follow_up_prompts && tip.follow_up_prompts.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-warm-600 mb-1 font-medium">
              Follow-up questions:
            </div>
            {tip.follow_up_prompts.map((prompt, index) => (
              <div key={index} className="text-xs text-warm-600 mb-0.5 pl-2 border-l border-warm-300">
                • {prompt}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}