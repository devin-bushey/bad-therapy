import React from 'react'

interface ChatHeaderProps {
  editing: boolean
  nameInput: string
  sessionName?: string
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
  setEditing: (v: boolean) => void
}

export function ChatHeader({ editing, nameInput, sessionName, onEdit, onChange, onSave, setEditing }: ChatHeaderProps) {
  return (
    <div style={{ width: '100%', maxWidth: 600, marginBottom: 8, textAlign: 'center' }}>
      {editing ? (
        <form onSubmit={e => { e.preventDefault(); onSave() }} style={{ display: 'inline-block' }}>
          <input
            value={nameInput}
            onChange={e => onChange(e.target.value)}
            autoFocus
            style={{ fontSize: 22, fontWeight: 700, background: '#23233a', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}
            onBlur={onSave}
          />
          <button type="submit" style={{ marginLeft: 8 }} aria-label="save">Save</button>
        </form>
      ) : (
        <span
          style={{ fontSize: 22, fontWeight: 700, color: '#fff', cursor: 'pointer', background: '#23233a', borderRadius: 8, padding: '4px 12px' }}
          onClick={onEdit}
        >
          {sessionName || 'Untitled'}
        </span>
      )}
      {!editing && (
        <button onClick={onEdit} style={{ marginLeft: 8 }} aria-label="edit">Edit</button>
      )}
    </div>
  )
} 