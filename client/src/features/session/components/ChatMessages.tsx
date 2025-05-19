import type { Message } from '../../../types/session.types'
import TypingBubble from './TypingBubble'
import { useNavigate } from 'react-router-dom'

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
  showTypingBubble?: boolean
}

export function ChatMessages({ messages, loading, showTypingBubble }: ChatMessagesProps) {
  const navigate = useNavigate()

  if (loading && messages.length === 0)
    return <div style={{ color: '#bbb', fontSize: 18, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading messages…</div>

  const filteredMessages = Array.isArray(messages) ? messages.filter((m: Message) => m.content !== '') : []
  
  function parseSummaryAndTherapists(msg: string): { summary: string | null, therapists: { name: string; specialty: string; website?: string }[] | null } {
    // Try to find the first JSON object in the string
    const jsonStart = msg.indexOf('{')
    if (jsonStart === -1) return { summary: msg, therapists: null }
    const summary = msg.slice(0, jsonStart).trim() || null
    try {
      const obj = JSON.parse(msg.slice(jsonStart))
      if (Array.isArray(obj.therapists)) return { summary, therapists: obj.therapists as { name: string; specialty: string; website?: string }[] }
      return { summary: msg, therapists: null }
    } catch {
      return { summary: msg, therapists: null }
    }
  }

  function TherapistCard({ therapist }: { therapist: { name: string; specialty: string; website?: string } }) {
    return (
      <div style={{ border: '1px solid #444', borderRadius: 8, padding: 12, margin: 8, background: '#23233a' }}>
        <div><b>{therapist.name}</b></div>
        <div>{therapist.specialty}</div>
        {therapist.website ? (
          <a href={therapist.website} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
            {therapist.website}
          </a>
        ) : (
          <span style={{ color: '#b0b0b0' }}>Could not find a website for this therapist</span>
        )}
      </div>
    )
  }

  function isJournalSavedMessage(msg: string) {
    return msg === 'Journal entry saved! Click me to view it.'
  }

  return (
    <>
      {filteredMessages.map((m, i) => {
        const { summary, therapists } = parseSummaryAndTherapists(m.content)
        const elements = []
        if (summary) {
          if (isJournalSavedMessage(summary)) {
            elements.push(
              <div
                key={i + '-journal-link'}
                style={{
                  textAlign: m.type === 'human' ? 'right' : 'left',
                  margin: '12px 0',
                }}
              >
                <span
                  onClick={() => navigate('/journal')}
                  style={{
                    display: 'inline-block',
                    background: '#a259f7', // purple
                    color: '#fff',
                    borderRadius: 16,
                    padding: '10px 18px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(162,89,247,0.15)'
                  }}
                >
                  {summary}
                </span>
              </div>
            )
          } else {
            elements.push(
              <div key={i + '-summary'} style={{ textAlign: m.type === 'human' ? 'right' : 'left', margin: '12px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: m.type === 'human' ? '#2563eb' : '#282846',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '10px 18px',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  textAlign: 'left',
                }}>{summary}</span>
              </div>
            )
          }
        }
        if (therapists) elements.push(
          therapists.map((therapist: { name: string; specialty: string; website?: string }, idx: number) => (
            <TherapistCard key={i + '-' + idx} therapist={therapist} />
          ))
        )
        if (elements.length > 0) return elements
        // fallback: render as plain text
        return (
          <div key={i} style={{ textAlign: m.type === 'human' ? 'right' : 'left', margin: '12px 0' }}>
            <span style={{
              display: 'inline-block',
              background: m.type === 'human' ? '#2563eb' : '#282846',
              color: '#fff',
              borderRadius: 16,
              padding: '10px 18px',
              maxWidth: '80%',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              textAlign: 'left',
            }}>{m.content}</span>
          </div>
        )
      })}
      {showTypingBubble ? <TypingBubble /> : null}
    </>
  )
}

// Add keyframes for typing-bounce animation
const style = document.createElement('style')
style.innerHTML = `@keyframes typing-bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }`
document.head.appendChild(style) 