import { Editor } from '@tiptap/react'
// Note: You must add the Color extension to your editor for setColor to work.

export default function JournalToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const btn = (onClick: () => void, active: boolean, children: any, aria: string) => (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{
        background: active ? '#2563eb' : '#23233a',
        color: active ? '#fff' : '#60a5fa',
        border: 'none',
        borderRadius: 4,
        padding: '0 10px',
        height: 28,
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >{children}</button>
  )
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: '#181824', borderRadius: 6, padding: 4, width: 'fit-content' }}>
      {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'B', 'Bold')}
      {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'I', 'Italic')}
      {/* {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'List', 'Bullet List')} */}
      <input type="color" onChange={e => editor.chain().focus().setColor(e.target.value).run()} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} aria-label="Text color" />
    </div>
  )
} 