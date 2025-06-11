import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useTips } from '../hooks/useTips'
import { createSession } from '../services/sessionServices'
import type { DailyTip, ResourceLink } from '../services/tipsService'

function getTipTypeInfo(type: string) {
    switch (type) {
        case 'prompt':
            return { label: 'CONVERSATION STARTER', color: '#60a5fa', bgColor: '#1f2937' }
        case 'info':
            return { label: 'SELF-CARE TIP', color: '#34d399', bgColor: '#064e3b' }
        case 'ai_guidance':
            return { label: 'AI THERAPY TIP', color: '#a78bfa', bgColor: '#2d1b69' }
        case 'resource':
            return { label: 'HELPFUL RESOURCE', color: '#f59e0b', bgColor: '#451a03' }
        default:
            return { label: 'TIP', color: '#9ca3af', bgColor: '#1f2937' }
    }
}

function renderLinkCard(link: ResourceLink) {
    const getSourceIcon = (sourceType: string) => {
        switch (sourceType.toLowerCase()) {
            case 'article': return '🔗'
            case 'video': return '🎥'
            case 'app': return '📱'
            case 'exercise': return '🏃‍♀️'
            case 'crisis_support': return '🆘'
            default: return '🔗'
        }
    }

    const getCredibilityColor = (score?: number) => {
        if (!score) return '#9ca3af'
        if (score >= 0.8) return '#34d399'
        if (score >= 0.6) return '#fbbf24'
        return '#f87171'
    }

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#60a5fa'
                e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#374151'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1rem' }}>{getSourceIcon(link.source_type)}</span>
                <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#e5e7eb',
                    flex: 1
                }}>
                    {link.title}
                </span>
                {link.credibility_score && (
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getCredibilityColor(link.credibility_score),
                    }} />
                )}
            </div>
            {link.description && (
                <p style={{ 
                    fontSize: '0.8rem', 
                    color: '#9ca3af', 
                    margin: 0,
                    lineHeight: '1.4'
                }}>
                    {link.description}
                </p>
            )}
            <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginTop: '0.25rem',
                textTransform: 'capitalize'
            }}>
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
            
            const session = await createSession(token, `Session: ${tip.content.slice(0, 30)}...`, user.sub)
            navigate(`/chat?sessionId=${session.id}&initialPrompt=${encodeURIComponent(tip.content)}`)
        } catch (error) {
            console.error('Failed to create session from tip:', error)
        }
    }

    if (loading) {
        return (
            <section>
                <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Daily Tip</h2>
                <div className="card" style={{ padding: '1rem', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: '#b3b3b3' }}>Loading your daily tip...</div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section>
                <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Daily Tip</h2>
                <div className="card" style={{ padding: '1rem', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: '#b3b3b3' }}>Unable to load tip. Try refreshing the page.</div>
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
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Daily Tip</h2>
            <div 
                className="card"
                style={{ 
                    padding: '1rem',
                    minHeight: '80px',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${isClickable ? '#374151' : '#2d3748'}`
                }}
                onClick={() => isClickable && handleTipClick(tip)}
                onMouseOver={(e) => {
                    if (isClickable) {
                        e.currentTarget.style.borderColor = '#60a5fa'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                }}
                onMouseOut={(e) => {
                    if (isClickable) {
                        e.currentTarget.style.borderColor = '#374151'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                }}>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        background: typeInfo.bgColor, 
                        color: typeInfo.color, 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontWeight: 600
                    }}>
                        {typeInfo.label}
                    </span>
                    {isClickable && (
                        <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#9ca3af', 
                            fontStyle: 'italic'
                        }}>
                            Click to start session
                        </span>
                    )}
                    {tip.technique_category && tip.technique_category !== 'general' && (
                        <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#6b7280',
                            background: '#1f2937',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                        }}>
                            {tip.technique_category}
                        </span>
                    )}
                </div>
                <div style={{ 
                    lineHeight: '1.6',
                    color: '#e5e7eb',
                    marginBottom: tip.link ? '0.5rem' : '0'
                }}>
                    {tip.content}
                </div>
                {tip.link && renderLinkCard(tip.link)}
                {tip.follow_up_prompts && tip.follow_up_prompts.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#9ca3af', 
                            marginBottom: '0.5rem',
                            fontWeight: 500
                        }}>
                            Follow-up questions:
                        </div>
                        {tip.follow_up_prompts.map((prompt, index) => (
                            <div key={index} style={{ 
                                fontSize: '0.8rem', 
                                color: '#d1d5db',
                                marginBottom: '0.25rem',
                                paddingLeft: '0.5rem',
                                borderLeft: '2px solid #374151'
                            }}>
                                • {prompt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}