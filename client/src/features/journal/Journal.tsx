import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function Journal() {
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => {
      // Optionally handle content change
    }
  })

  useEffect(() => {
    // TODO: fetch journal content from API and set with editor.commands.setContent(...)
  }, [editor])

  const handleSave = async () => {
    setSaving(true)
    // TODO: send editor?.getJSON() or editor?.getHTML() to API
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <>
      <style>{`.ProseMirror { height: 100% !important; min-height: 0 !important; } .ProseMirror:focus { outline: none !important; box-shadow: none !important; }`}</style>
      <div className="journal-container flex flex-col items-center w-screen max-w-full h-screen" style={{ background: '#181824', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', marginTop: 24, marginBottom: 8, textAlign: 'center', gap: 8, overflow: 'hidden', justifyContent: 'center', position: 'relative' }}>
          <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', left: 0, background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', padding: 0, minWidth: 48 }}>Back</button>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', padding: '4px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Journal</span>
        </div>
        <div className="flex-1 w-full max-w-[600px] bg-[#23233a] rounded-2xl p-6 flex flex-col mb-10 min-h-0" style={{flex:1, minHeight:0, height:'auto'}}>
          <EditorContent editor={editor} className="tiptap flex-1 h-full min-h-0 prose prose-invert focus:outline-none bg-[#23233a] text-white rounded-lg p-2 overflow-y-auto" style={{height:'100%', minHeight:0}} />
        </div>
        <button onClick={handleSave} disabled={saving} style={{ width: '100%', maxWidth: 600, margin: '0 auto 24px auto', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, boxShadow: '0 1px 4px 0 #0002', cursor: 'pointer', position: 'sticky', bottom: 0 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </>
  )
} 