import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser as ProseMirrorDOMParser } from 'prosemirror-model'
import 'prosemirror-view/style/prosemirror.css'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0], parseDOM: [{ tag: 'p' }] },
    text: { group: 'inline' }
  },
  marks: {}
})

export default function Journal() {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!editorRef.current) return
    const state = EditorState.create({
      doc: ProseMirrorDOMParser.fromSchema(schema).parse(document.createElement('div')),
      schema
    })
    viewRef.current = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(tr) {
        const newState = viewRef.current!.state.apply(tr)
        viewRef.current!.updateState(newState)
        setContent(newState.doc.textContent)
      }
    })
    return () => viewRef.current?.destroy()
  }, [])

  // Placeholder for fetching journal content
  useEffect(() => {
    // TODO: fetch journal content from API and load into editor
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // TODO: send viewRef.current.state.doc to API
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <div className="chat-container" style={{ height: '100dvh', background: '#181824', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw', maxWidth: '100vw', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', marginTop: 24, marginBottom: 8, textAlign: 'left', gap: 8, overflow: 'hidden' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', padding: 0, minWidth: 48 }}>Back</button>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', background: '#23233a', borderRadius: 8, padding: '4px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>Journal</span>
      </div>
      <div style={{ flex: 1, width: '100%', maxWidth: 600, overflowY: 'auto', background: '#23233a', borderRadius: 12, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: 40 }}>
        <div ref={editorRef} style={{ flex: 1, minHeight: 200, background: '#23233a', color: '#fff', borderRadius: 8, padding: 8, outline: 'none' }} />
      </div>
      <button onClick={handleSave} disabled={saving} style={{ width: '100%', maxWidth: 600, margin: '0 auto 24px auto', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, boxShadow: '0 1px 4px 0 #0002', cursor: 'pointer', position: 'sticky', bottom: 0 }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
} 