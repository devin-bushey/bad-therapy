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
        {prompts.length > 0 && <p className="text-xs text-warm-600 mb-2 italic">💡 Suggested prompts - click to use</p>}
        {prompts.map(p => (
          <button
            key={p}
            onClick={() => onPromptClick(p)}
            className="inline-block bg-ai-500 text-warm-50 border border-ai-400 rounded-2xl px-4 py-2.5 max-w-[80%] break-words whitespace-pre-line my-1.5 text-left font-medium shadow-sm outline-none transition-all duration-200 hover:bg-ai-600 hover:border-ai-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
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