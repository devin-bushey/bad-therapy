import { Editor } from '@tiptap/react'
// Note: You must add the Color extension to your editor for setColor to work.

interface JournalToolbarProps {
  editor: Editor | null
  onAIAssistClick?: () => void
  aiLoading?: boolean
}

export default function JournalToolbar({ editor, onAIAssistClick, aiLoading = false }: JournalToolbarProps) {
  if (!editor) return null
  
  const Button = ({ onClick, active, children, aria }: { 
    onClick: () => void, 
    active: boolean, 
    children: React.ReactNode, 
    aria: string 
  }) => (
    <button
      onClick={onClick}
      aria-label={aria}
      className={`border-none rounded px-2.5 h-7 font-semibold text-sm cursor-pointer transition-colors ${
        active 
          ? 'bg-earth-500 text-warm-50' 
          : 'bg-warm-100 text-earth-500 hover:bg-warm-200'
      }`}
    >
      {children}
    </button>
  )
  
  return (
    <div className="flex gap-1.5 mb-3 bg-warm-200 rounded p-1 w-fit">
      <Button 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        active={editor.isActive('bold')} 
        aria="Bold"
      >
        B
      </Button>
      <Button 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        active={editor.isActive('italic')} 
        aria="Italic"
      >
        I
      </Button>
      <input 
        type="color" 
        onChange={e => editor.chain().focus().setColor(e.target.value).run()} 
        className="w-7 h-7 border-none bg-transparent cursor-pointer p-0 rounded" 
        aria-label="Text color" 
      />
      
      {/* AI Writing Assistant Button */}
      {onAIAssistClick && (
        <button
          onClick={onAIAssistClick}
          disabled={aiLoading}
          className="border-none rounded px-2.5 h-7 font-semibold text-sm cursor-pointer transition-colors bg-ai-500 text-warm-50 hover:bg-ai-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="AI Writing Assistance"
          title="Get AI writing prompts"
        >
          {aiLoading ? '...' : '💡'}
        </button>
      )}
    </div>
  )
} 