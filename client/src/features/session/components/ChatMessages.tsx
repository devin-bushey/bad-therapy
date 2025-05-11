import type { Message } from '../../../types/session.types'
import TypingBubble from './TypingBubble'

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
  showTypingBubble?: boolean
}

export function ChatMessages({ messages, loading, showTypingBubble }: ChatMessagesProps) {
  if (loading && messages.length === 0)
    return <div style={{ color: '#bbb', fontSize: 18, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading messages…</div>

  const filteredMessages = Array.isArray(messages) ? messages.filter((m: Message) => m.content !== '') : []

  return (
    <>
      {filteredMessages.map((m, i) => (
        <div key={i} style={{ textAlign: m.isFromUser ? 'right' : 'left', margin: '12px 0' }}>
          <span style={{
            display: 'inline-block',
            background: m.isFromUser ? '#2563eb' : '#282846',
            color: '#fff',
            borderRadius: 16,
            padding: '10px 18px',
            maxWidth: '80%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
            textAlign: m.isFromUser ? 'left' : undefined
          }}>
            {m.content.split('\n').map((line, idx, arr) => idx < arr.length - 1 ? <span key={idx}>{line}<br /></span> : line)}
          </span>
        </div>
      ))}
      {showTypingBubble ? <TypingBubble /> : null}
    </>
  )
}

// Add keyframes for typing-bounce animation
const style = document.createElement('style')
style.innerHTML = `@keyframes typing-bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }`
document.head.appendChild(style) 