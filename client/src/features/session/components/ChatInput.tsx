import React from 'react'

interface ChatInputProps {
  input: string
  onInput: (v: string) => void
  onSend: () => void
  loading: boolean
  onLightbulbClick?: () => void
  disabled?: boolean
  disabledMessage?: string
}

export function ChatInput({ input, onInput, onSend, loading, onLightbulbClick, disabled, disabledMessage }: ChatInputProps) {
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
      if (!loading && !disabled && input.trim()) onSend()
    }
  }
  return (
    <div className="w-full flex justify-center pb-2">
      <form className="flex items-end gap-2 w-full max-w-[600px]" onSubmit={e => { e.preventDefault(); if (!disabled) onSend() }}>
        <button
          aria-label="Show follow-up suggestions"
          type="button"
          onClick={onLightbulbClick}
          disabled={loading}
          className={`h-11 w-9 p-0 rounded-lg bg-transparent border-none text-lg text-yellow-400 transition-opacity duration-200 flex items-center justify-center ${
            loading ? 'cursor-not-allowed opacity-40' : 'cursor-pointer opacity-70 hover:opacity-100'
          }`}
        >
          💡
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => !disabled && onInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? (disabledMessage || "Message limit reached") : "Type your message…"}
          rows={1}
          disabled={disabled}
          className={`flex-1 p-3.5 rounded-lg text-base leading-relaxed resize-none max-h-[200px] overflow-y-auto box-border outline-none focus:outline-none focus:ring-2 focus:ring-earth-500 ring-1 ring-inset ${
            disabled ? 'bg-warm-100 text-warm-400 ring-warm-100 cursor-not-allowed' : 'bg-warm-50 text-warm-800 ring-warm-200'
          }`}
        />
        <button type="submit" disabled={loading || !input.trim() || disabled} className={`h-11 w-11 rounded-full bg-earth-500 text-warm-50 text-lg border-none shadow-none hover:bg-earth-600 transition-colors disabled:opacity-50 flex items-center justify-center ${loading || !input.trim() || disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
} 