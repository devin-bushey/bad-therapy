interface ChatHeaderProps {
  editing: boolean
  nameInput: string
  sessionName?: string
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
  setEditing: (v: boolean) => void
}

export function ChatHeader({ editing, nameInput, sessionName, onEdit, onChange, onSave }: ChatHeaderProps) {
  return (
    <div className="w-full max-w-[600px] mb-2 text-center">
      {editing ? (
        <form onSubmit={e => { e.preventDefault(); onSave() }} className="inline-block">
          <input
            value={nameInput}
            onChange={e => onChange(e.target.value)}
            autoFocus
            className="text-xl font-bold text-white border-none rounded-lg py-1 px-3 text-center"
            style={{ backgroundColor: 'rgb(40, 40, 70)' }}
            onBlur={onSave}
          />
        </form>
      ) : (
        <span
          className="text-xl font-bold text-white cursor-pointer rounded-lg py-1 px-3"
          style={{ backgroundColor: 'rgb(40, 40, 70)' }}
          onClick={onEdit}
        >
          {sessionName || 'Untitled'}
        </span>
      )}
    </div>
  )
}