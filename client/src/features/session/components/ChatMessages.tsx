import { useEffect, useRef } from 'react'
import type { Message } from '../../../types/session.types'
import TypingBubble from './TypingBubble'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
  showTypingBubble?: boolean
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => (
          <code className="bg-warm-300 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-warm-300 p-2 rounded mt-2 mb-2 overflow-x-auto">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-warm-400 pl-3 italic mb-2">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
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

  function parseJournalMessage(msg: string): { isJournalMessage: boolean; entryId?: string; displayText?: string } {
    // Check for new format with entry ID
    const newFormatMatch = msg.match(/^(Journal entry saved! Click to view it\.) \{"entry_id": "([^"]+)"\}$/)
    if (newFormatMatch) {
      return {
        isJournalMessage: true,
        entryId: newFormatMatch[2],
        displayText: newFormatMatch[1]
      }
    }
    
    // Check for legacy format for backward compatibility
    if (msg === 'Journal entry saved! Click me to view it.') {
      return {
        isJournalMessage: true,
        displayText: msg
      }
    }
    
    return { isJournalMessage: false }
  }

  return (
    <>
      {filteredMessages.map((m, i) => {
        const { summary, therapists } = parseSummaryAndTherapists(m.content)
        const elements = []
        if (summary) {
          const journalInfo = parseJournalMessage(summary)
          if (journalInfo.isJournalMessage) {
            const handleJournalClick = () => {
              if (journalInfo.entryId) {
                navigate(`/journal/${journalInfo.entryId}`)
              } else {
                navigate('/journal')
              }
            }
            
            elements.push(
              <div
                key={i + '-journal-link'}
                className={`my-3 ${m.type === 'human' ? 'text-right' : 'text-left'}`}
              >
                <span
                  onClick={handleJournalClick}
                  className="inline-block bg-ai-500 text-warm-50 rounded-2xl py-2.5 px-4 max-w-[80%] break-words whitespace-pre-line text-left cursor-pointer shadow-lg hover:bg-ai-600 transition-colors"
                >
                  {journalInfo.displayText}
                </span>
              </div>
            )
          } else {
            elements.push(
              <div key={i + '-summary'} className={`my-3 ${m.type === 'human' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block rounded-2xl py-2.5 px-4 max-w-[80%] break-words text-left ${
                  m.type === 'human' ? 'bg-earth-500 text-warm-50 whitespace-pre-line' : 'bg-warm-200 text-warm-800 border border-warm-300'
                }`}>
                  {m.type === 'human' ? summary : <MarkdownMessage content={summary} />}
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
            <span className={`inline-block rounded-2xl py-2.5 px-4 max-w-[80%] break-words text-left ${
              m.type === 'human' ? 'bg-earth-500 text-warm-50 whitespace-pre-line' : 'bg-warm-200 text-warm-800 border border-warm-300'
            }`}>
              {m.type === 'human' ? m.content : <MarkdownMessage content={m.content} />}
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