import React from 'react'
import TypingBubble from './TypingBubble'

interface SuggestedPromptsProps {
  prompts: string[]
  onPromptClick: (prompt: string) => void
  align?: 'flex-end' | 'flex-start' | 'center'
  loading?: boolean
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ prompts, onPromptClick, align = 'flex-end', loading = false }) => {
  const alignClass = align === 'flex-end' ? 'items-end' : align === 'flex-start' ? 'items-start' : 'items-center'
  
  return (
  <div className={`w-full flex flex-col gap-0 my-3 mb-15 ${alignClass}`}>
    {loading ? (
      <TypingBubble />
    ) : (
      <>
        {prompts.length > 0 && <p className="text-xs text-gray-500 mb-1">Click a suggested prompt</p>}
        {prompts.map(p => (
          <button
            key={p}
            onClick={() => onPromptClick(p)}
            className="inline-block bg-purple-600 text-white border-none rounded-2xl px-4 py-2.5 max-w-[80%] break-words whitespace-pre-line my-1.5 text-left font-medium shadow-sm outline-none transition-colors hover:bg-purple-700"
          >
            {p}
          </button>
        ))}
      </>
    )}
  </div>
  )
}

export default SuggestedPrompts 