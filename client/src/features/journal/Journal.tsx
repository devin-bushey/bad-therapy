import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useSaveJournalMutation, useJournalQuery } from './hooks/useSaveJournal'
import { useAuth0 } from '@auth0/auth0-react'

export default function Journal() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const editor = useEditor({
    extensions: [StarterKit],
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

  const handleSave = async () => {
    if (!editor || !token) return
    await saveMutation.mutateAsync(editor.getJSON())
  }

  return (
    <>
      <style>{`.ProseMirror { height: 100% !important; min-height: 0 !important; } .ProseMirror:focus { outline: none !important; box-shadow: none !important; }`}</style>
      <div className="journal-container flex flex-col items-center w-screen max-w-full h-screen" style={{ background: '#181824', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', marginTop: 24, marginBottom: 8, textAlign: 'center', gap: 8, overflow: 'hidden', justifyContent: 'center', position: 'relative' }}>
          <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', left: 10, background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', padding: 0, minWidth: 48 }}>Back</button>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', padding: '4px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Journal</span>
          <button onClick={handleSave} disabled={saveMutation.isPending || !token} style={{ position: 'absolute', right: 10, background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', padding: 0, minWidth: 48 }}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="flex-1 w-full max-w-[600px] bg-[#23233a] rounded-2xl p-6 flex flex-col mb-10 min-h-0" style={{flex:1, minHeight:0, height:'auto'}}>
          <EditorContent editor={editor} className="tiptap flex-1 h-full min-h-0 prose prose-invert focus:outline-none bg-[#23233a] text-white rounded-lg p-2 overflow-y-auto" style={{height:'100%', minHeight:0}} />
        </div>
      </div>
    </>
  )
} 