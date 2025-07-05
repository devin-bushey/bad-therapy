import { useEffect } from 'react'
import TypingBubble from '../../session/components/TypingBubble'

interface SuggestedPromptsModalProps {
  isOpen: boolean
  onClose: () => void
  prompts: string[]
  onPromptClick: (prompt: string) => void
  loading?: boolean
}

export default function SuggestedPromptsModal({ 
  isOpen, 
  onClose, 
  prompts, 
  onPromptClick, 
  loading = false 
}: SuggestedPromptsModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose() 
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePromptClick = (prompt: string) => {
    onPromptClick(prompt)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-warm-100 border border-warm-200 text-warm-800 p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-warm-800">💡 Writing Prompts</h3>
          <button 
            onClick={onClose}
            className="bg-transparent border-none text-warm-600 hover:text-warm-800 text-xl cursor-pointer p-1 rounded-full hover:bg-warm-200 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <TypingBubble />
          </div>
        ) : (
          <>
            {prompts.length > 0 ? (
              <>
                <p className="text-sm text-warm-600 mb-4 italic">
                  Choose a prompt to help guide your journaling
                </p>
                <div className="space-y-3">
                  {prompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full bg-ai-500 text-warm-50 border border-ai-400 rounded-2xl px-4 py-3 break-words whitespace-pre-line text-left font-medium shadow-sm outline-none transition-all duration-200 hover:bg-ai-600 hover:border-ai-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-warm-600 text-center py-8">
                No prompts available at the moment. Try again later!
              </p>
            )}
          </>
        )}
        
        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose} 
            className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-200 hover:text-warm-800 rounded-lg px-4 py-2 cursor-pointer transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}