import React from 'react'

interface ChatInputProps {
  input: string
  onInput: (v: string) => void
  onSend: () => void
  loading: boolean
}

export function ChatInput({ input, onInput, onSend, loading }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
  }, [input])
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading && input.trim()) onSend()
    }
  }
  return (
    <div className="chat-input">
      <form style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%', maxWidth: 600, margin: '0 auto' }} onSubmit={e => { e.preventDefault(); onSend() }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => onInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          rows={1}
          style={{ flex: 1, padding: 14, borderRadius: 8, border: 'none', fontSize: 16, lineHeight: 1.5, background: '#181824', color: '#fff', resize: 'none', maxHeight: 200, overflowY: 'auto', boxSizing: 'border-box', outline: 'none', outlineColor: '#444', outlineWidth: 1, outlineStyle: 'solid' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ height: 44, minWidth: 80, marginBottom: 5, paddingTop: 7, borderRadius: 8, background: '#3b5bff', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', padding: '0 1.5em', boxShadow: 'none' }}>Send</button>
      </form>
    </div>
  )
} 