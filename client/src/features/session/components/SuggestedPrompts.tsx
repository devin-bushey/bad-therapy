import React from 'react'
import TypingBubble from './TypingBubble'

interface SuggestedPromptsProps {
  prompts: string[]
  onPromptClick: (prompt: string) => void
  align?: 'flex-end' | 'flex-start' | 'center'
  loading?: boolean
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ prompts, onPromptClick, align = 'flex-end', loading = false }) => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, alignItems: align, margin: '12px 0 60px 0' }}>
    {loading ? (
      <TypingBubble />
    ) : (
      prompts.map(p => (
        <button
          key={p}
          onClick={() => onPromptClick(p)}
          className="inline-block bg-purple-600 text-white border-none rounded-2xl px-4 py-2.5 max-w-[80%] break-words whitespace-pre-line my-1.5 text-left font-medium shadow-sm outline-none transition-colors hover:bg-purple-700"
        >
          {p}
        </button>
      ))
    )}
  </div>
)

export default SuggestedPrompts 