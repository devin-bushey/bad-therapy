import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { useAuth0 } from '@auth0/auth0-react'
import { useJournalEntry, useUpdateJournalEntry } from './hooks/useJournalEntries'
import JournalToolbar from './components/JournalToolbar'
import StarterKit from '@tiptap/starter-kit'

export default function JournalEntry() {
  const { entryId } = useParams<{ entryId: string }>()
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [token, setToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    getAccessTokenSilently().then(setToken)
  }, [isAuthenticated, getAccessTokenSilently])

  const { entry, loading, error } = useJournalEntry(entryId || '', isAuthenticated, getAccessTokenSilently)
  const updateEntry = useUpdateJournalEntry()

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
    content: '',
    autofocus: true,
    editable: true,
    onUpdate: () => {
      setHasUnsavedChanges(true)
    }
  })

  useEffect(() => {
    if (editor && entry) {
      editor.commands.setContent(entry.content)
      setTitle(entry.title || 'Untitled Entry')
      setHasUnsavedChanges(false)
    }
  }, [editor, entry])

  const handleSave = async () => {
    if (!editor || !token || !entryId) return
    try {
      await updateEntry.mutateAsync({
        token,
        entryId,
        title,
        content: editor.getJSON()
      })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save journal entry:', error)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setHasUnsavedChanges(true)
  }

  if (loading || !editor) {
    return (
      <div className="h-screen flex items-center justify-center bg-warm-50 text-earth-500 text-xl font-semibold">
        Loading journal entry...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="text-error-500 text-xl font-semibold mb-4">
            Failed to load journal entry
          </div>
          <button
            onClick={() => navigate('/journal')}
            className="bg-earth-500 text-warm-50 rounded-lg px-6 py-3 border-none font-semibold hover:bg-earth-600 transition-colors"
          >
            Back to Journal List
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`.ProseMirror { height: 100% !important; min-height: 0 !important; } .ProseMirror:focus { outline: none !important; box-shadow: none !important; }`}</style>
      <div className="h-screen w-screen flex flex-col bg-warm-50 items-center max-w-full overflow-hidden">
        <div className="w-full max-w-[600px] flex items-center mt-6 mb-2 text-center gap-2 overflow-hidden justify-center relative">
          <button 
            onClick={() => navigate('/journal')} 
            className="absolute left-2 bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 min-w-[48px] hover:text-earth-600 transition-colors"
          >
            Back
          </button>
          <span className="text-xl font-bold text-warm-800 py-1 px-3 whitespace-nowrap overflow-hidden text-ellipsis">
            Journal Entry
          </span>
          <button 
            onClick={handleSave} 
            disabled={updateEntry.isPending || !token || !hasUnsavedChanges} 
            className="absolute right-2 bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 min-w-[48px] hover:text-earth-600 transition-colors disabled:text-warm-400 disabled:cursor-not-allowed"
          >
            {updateEntry.isPending ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
          </button>
        </div>
        
        <div className="flex-1 w-full max-w-[600px] bg-warm-100 border border-warm-200 rounded-2xl p-6 flex flex-col mb-10 min-h-0" style={{flex:1, minHeight:0, height:'auto'}}>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Entry title..."
            className="text-xl font-semibold text-warm-800 bg-transparent border-none outline-none mb-4 placeholder-warm-500"
          />
          
          {entry?.created_at && (
            <div className="text-sm text-warm-600 mb-4">
              <div>Created: {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}</div>
              {entry.updated_at && entry.updated_at !== entry.created_at && (
                <div>Updated: {new Date(entry.updated_at).toLocaleDateString()} {new Date(entry.updated_at).toLocaleTimeString()}</div>
              )}
            </div>
          )}

          <JournalToolbar editor={editor} />
          <EditorContent 
            editor={editor} 
            className="tiptap flex-1 h-full min-h-0 prose prose-invert focus:outline-none bg-warm-100 text-warm-800 rounded-lg p-2 overflow-y-auto" 
            style={{height:'100%', minHeight:0}} 
          />
        </div>
      </div>
    </>
  )
}