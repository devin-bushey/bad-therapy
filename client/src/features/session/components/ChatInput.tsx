interface ChatInputProps {
  input: string
  onInput: (v: string) => void
  onSend: () => void
  loading: boolean
}

export function ChatInput({ input, onInput, onSend, loading }: ChatInputProps) {
  return (
    <form style={{ display: 'flex', width: '100vw', maxWidth: 600 }} onSubmit={e => { e.preventDefault(); onSend() }}>
      <input
        value={input}
        onChange={e => onInput(e.target.value)}
        placeholder="Type your message…"
        style={{ flex: 1, padding: 14, borderRadius: 8, border: 'none', fontSize: 16, background: '#181824', color: '#fff' }}
      />
      <button type="submit" disabled={loading || !input.trim()} style={{ marginLeft: 8 }}>Send</button>
    </form>
  )
} 