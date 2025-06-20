import { useEffect, useRef } from 'react'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showTypingBubble, loading])

  if (loading && messages.length === 0)
    return <div className="absolute inset-0 flex items-center justify-center text-warm-600 text-lg">Loading messages…</div>

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
      <div className="border border-warm-200 rounded-lg p-3 m-2 bg-warm-100">
        <div className="font-bold text-warm-800">{therapist.name}</div>
        <div className="text-warm-600">{therapist.specialty}</div>
        {therapist.website ? (
          <a 
            href={therapist.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-earth-500 break-all max-w-full inline-block break-words hover:text-earth-600 transition-colors"
          >
            {therapist.website}
          </a>
        ) : (
          <span className="text-warm-500">Could not find a website for this therapist</span>
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
                className={`my-3 ${m.type === 'human' ? 'text-right' : 'text-left'}`}
              >
                <span
                  onClick={() => navigate('/journal')}
                  className="inline-block bg-ai-500 text-warm-50 rounded-2xl py-2.5 px-4 max-w-[80%] break-words whitespace-pre-line text-left cursor-pointer shadow-lg hover:bg-ai-600 transition-colors"
                >
                  {summary}
                </span>
              </div>
            )
          } else {
            elements.push(
              <div key={i + '-summary'} className={`my-3 ${m.type === 'human' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block rounded-2xl py-2.5 px-4 max-w-[80%] break-words whitespace-pre-line text-left ${
                  m.type === 'human' ? 'bg-earth-500 text-warm-50' : 'bg-warm-200 text-warm-800 border border-warm-300'
                }`}>
                  {summary}
                </span>
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
          <div key={i} className={`my-3 ${m.type === 'human' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block rounded-2xl py-2.5 px-4 max-w-[80%] break-words whitespace-pre-line text-left ${
              m.type === 'human' ? 'bg-earth-500 text-warm-50' : 'bg-warm-200 text-warm-800 border border-warm-300'
            }`}>
              {m.content}
            </span>
          </div>
        )
      })}
      {showTypingBubble ? <TypingBubble /> : null}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </>
  )
}

// Note: typing-bounce animation is now handled in TypingBubble component 