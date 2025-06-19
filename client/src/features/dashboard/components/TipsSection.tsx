import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useTips } from '../hooks/useTips'
import { createSession } from '../services/sessionServices'
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
      className="block mt-3 p-3 bg-gray-900 border border-gray-700 rounded-lg no-underline text-inherit transition-all duration-200 hover:border-amber-500 hover:-translate-y-px"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{getSourceIcon(link.source_type)}</span>
        <span className="text-sm font-semibold text-gray-200 flex-1">
          {link.title}
        </span>
        {link.credibility_score && (
          <div className={cn('w-2 h-2 rounded-full', getCredibilityColorClass(link.credibility_score))} />
        )}
      </div>
      {link.description && (
        <p className="text-xs text-gray-400 m-0 leading-snug">
          {link.description}
        </p>
      )}
      <div className="text-xs text-gray-500 mt-1 capitalize">
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
        <h2 className="font-bold mb-3">Daily Tip</h2>
        <div className="card p-4 min-h-[80px] flex items-center">
          <div className="flex items-center gap-3 text-gray-400">
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
        <h2 className="font-bold mb-3">Daily Tip</h2>
        <div className="card p-4 min-h-[80px] flex items-center">
          <div className="text-gray-400">Unable to load tip. Try refreshing the page.</div>
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
      <h2 className="font-bold mb-2 text-lg">Daily Tip</h2>
      <div 
        className={cn(
          'card p-3 min-h-[60px] bg-gray-950 border border-gray-800 rounded-lg shadow-sm transition-all duration-200',
          isClickable 
            ? 'cursor-pointer hover:border-amber-500 hover:-translate-y-px'
            : 'cursor-default'
        )}
        onClick={() => isClickable && handleTipClick(tip)}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide', typeInfo.badgeClass)}>
            {typeInfo.label}
          </span>
          {tip.technique_category && tip.technique_category !== 'general' && (
            <span className="text-[10px] text-gray-500 bg-gray-900 px-1 py-0.5 rounded uppercase ml-1">
              {tip.technique_category}
            </span>
          )}
          {isClickable && (
            <span className="text-[10px] text-gray-500 italic ml-auto">
              Click to start session
            </span>
          )}
        </div>
        <div className="leading-relaxed text-gray-200 text-base mb-1">
          {tip.content}
        </div>
        {tip.link && <ResourceLinkCard link={tip.link} />}
        {tip.follow_up_prompts && tip.follow_up_prompts.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1 font-medium">
              Follow-up questions:
            </div>
            {tip.follow_up_prompts.map((prompt, index) => (
              <div key={index} className="text-xs text-gray-400 mb-0.5 pl-2 border-l border-gray-800">
                • {prompt}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}