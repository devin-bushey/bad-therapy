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
          style={{
            display: 'inline-block',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '10px 18px',
            maxWidth: '80%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
            margin: '6px 0',
            fontSize: 'inherit',
            textAlign: 'left',
            fontWeight: 500,
            boxShadow: '0 1px 4px 0 #0002',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s'
          }}
        >
          {p}
        </button>
      ))
    )}
  </div>
)

export default SuggestedPrompts 