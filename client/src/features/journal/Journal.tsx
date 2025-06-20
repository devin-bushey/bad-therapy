import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { useSaveJournalMutation, useJournalQuery } from './hooks/useSaveJournal'
import { useAuth0 } from '@auth0/auth0-react'
import { useDebouncedAutoSave } from './hooks/useDebouncedAutoSave'
import JournalToolbar from './components/JournalToolbar'
import StarterKit from '@tiptap/starter-kit'

export default function Journal() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
    content: '',
    autofocus: true,
    editable: true,
  })

  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (!isAuthenticated) return
    getAccessTokenSilently().then(setToken)
  }, [isAuthenticated, getAccessTokenSilently])

  const journalQuery = useJournalQuery(token || '')
  const saveMutation = useSaveJournalMutation(token || '')

  useEffect(() => {
    if (editor && journalQuery.data?.content) {
      editor.commands.setContent(journalQuery.data.content)
    }
  }, [editor, journalQuery.data])

  const debounced = useDebouncedAutoSave({ editor, token, saveMutation, delay: 3000 })
  const handleSave = debounced?.handleSave

  if (journalQuery.isLoading || !editor) return (
    <div className="h-screen flex items-center justify-center bg-warm-50 text-earth-500 text-xl font-semibold">
      Loading journal...
    </div>
  )

  return (
    <>
      <style>{`.ProseMirror { height: 100% !important; min-height: 0 !important; } .ProseMirror:focus { outline: none !important; box-shadow: none !important; }`}</style>
      <div className="h-screen w-screen flex flex-col bg-warm-50 items-center max-w-full overflow-hidden">
        <div className="w-full max-w-[600px] flex items-center mt-6 mb-2 text-center gap-2 overflow-hidden justify-center relative">
          <button onClick={() => navigate('/dashboard')} className="absolute left-2 bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 min-w-[48px] hover:text-earth-600 transition-colors">
            Back
          </button>
          <span className="text-xl font-bold text-warm-800 py-1 px-3 whitespace-nowrap overflow-hidden text-ellipsis">
            Journal
          </span>
          <button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || !token} 
            className="absolute right-2 bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 min-w-[48px] hover:text-earth-600 transition-colors disabled:text-warm-400 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="flex-1 w-full max-w-[600px] bg-warm-100 border border-warm-200 rounded-2xl p-6 flex flex-col mb-10 min-h-0" style={{flex:1, minHeight:0, height:'auto'}}>
          {editor && editor.getText().trim().length === 0 && (
            <div className="bg-ai-50 text-ai-600 border border-ai-200 rounded-lg p-3 mb-3 text-center font-medium text-sm mx-auto shadow-sm">
              💡 Tip: You ask Arlo to save messages to your journal during a session. 
            </div>
          )}
          <JournalToolbar editor={editor} />
          <EditorContent editor={editor} className="tiptap flex-1 h-full min-h-0 prose prose-invert focus:outline-none bg-warm-100 text-warm-800 rounded-lg p-2 overflow-y-auto" style={{height:'100%', minHeight:0}} />
        </div>
      </div>
    </>
  )
} 