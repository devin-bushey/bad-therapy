import React from 'react'

interface ChatInputProps {
  input: string
  onInput: (v: string) => void
  onSend: () => void
  loading: boolean
  onLightbulbClick?: () => void
}

export function ChatInput({ input, onInput, onSend, loading, onLightbulbClick }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
  }, [input])
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading && input.trim()) onSend()
    }
  }
  return (
    <div className="chat-input">
      <form style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%', maxWidth: 600, margin: '0 auto' }} onSubmit={e => { e.preventDefault(); onSend() }}>
        <button
          aria-label="Show follow-up suggestions"
          type="button"
          onClick={onLightbulbClick}
          disabled={loading}
          style={{
            height: 44,
            minWidth: 44,
            marginBottom: 5,
            padding: 0,
            borderRadius: 8,
            background: 'none',
            border: 'none',
            fontSize: 24,
            color: '#ffd600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 0.7,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          💡
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          rows={1}
          style={{ flex: 1, padding: 14, borderRadius: 8, border: 'none', fontSize: 16, lineHeight: 1.5, background: '#181824', color: '#fff', resize: 'none', maxHeight: 200, overflowY: 'auto', boxSizing: 'border-box', outline: 'none', outlineColor: '#444', outlineWidth: 1, outlineStyle: 'solid' }}
        />
        <button type="submit" disabled={loading || !input.trim()} className={`h-11 min-w-[80px] mb-1.5 rounded-lg bg-blue-600 text-white font-semibold text-lg border-none px-6 shadow-none hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center ${loading || !input.trim() ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Send</button>
      </form>
    </div>
  )
} 