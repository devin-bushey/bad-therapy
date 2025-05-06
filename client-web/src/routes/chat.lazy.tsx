import { useState, useRef, useEffect } from 'react'
import { createLazyFileRoute, useMatch, useNavigate, Link } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/chat')({
  component: NewChat,
})

type Message = { sender: 'user' | 'bot'; text: string }
type Session = { id: string; name?: string; messages?: { content: string; isFromUser: boolean }[] }
type AIResponse = { result: string }

function NewChat() {
  const navigate = useNavigate()
  const { sessionId } = useMatch({ from: '/chat' }).search as { sessionId?: string }
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load or create session
  useEffect(() => {
    setError(null)
    if (sessionId) {
      fetch(`http://localhost:8000/sessions/${sessionId}`)
        .then(r => r.json())
        .then((s: Session) => {
          setSession(s)
          setNameInput(s.name || '')
          setMessages(
            (s.messages || []).map(m => ({ sender: m.isFromUser ? 'user' : 'bot', text: m.content }))
          )
        })
        .catch(() => setError('Failed to load session'))
    } else {
      fetch('http://localhost:8000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Chat' }),
      })
        .then(r => r.json())
        .then((s: Session) => {
          setSession(s)
          setNameInput(s.name || '')
          setMessages([])
          navigate({ to: '/chat', search: { sessionId: s.id } })
        })
        .catch(() => setError('Failed to create session'))
    }
    // eslint-disable-next-line
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || !session) return
    setLoading(true)
    setMessages(msgs => [...msgs, { sender: 'user', text: input }])
    setInput('')
    let botMsg = ''
    setMessages(msgs => [...msgs, { sender: 'bot', text: '' }])
    try {
      const res = await fetch('http://localhost:8000/ai/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, prompt: input }),
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = new TextDecoder().decode(value)
          botMsg += chunk
          setMessages(msgs => {
            const last = msgs[msgs.length - 1]
            if (last?.sender === 'bot') {
              return [...msgs.slice(0, -1), { sender: 'bot', text: botMsg }]
            }
            return msgs
          })
        }
      }
    } catch {
      setError('Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  async function handleRename() {
    if (!session || !nameInput.trim() || nameInput === session.name) {
      setEditingName(false)
      return
    }
    try {
      const res = await fetch(`http://localhost:8000/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput }),
      })
      if (!res.ok) throw new Error('Rename failed')
      const updated = await res.json()
      setSession(s => s ? { ...s, name: updated.name } : s)
    } catch {
      setError('Failed to rename session')
    }
    setEditingName(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col items-center py-4 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col h-[80vh]">
        <div className="px-6 py-4 border-b text-lg font-bold text-purple-600 flex items-center gap-2 relative">
          <Link to="/" className="text-2xl hover:scale-110 transition-transform" title="Go Home">🧠</Link>
          {editingName ? (
            <input
              className="ml-2 px-2 py-1 rounded border text-base font-normal w-40"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename() }}
              autoFocus
            />
          ) : (
            <>
              <span className="ml-2">{session?.name || 'New Chat'}</span>
              <button
                className="ml-2 text-purple-400 hover:text-purple-600 text-base"
                onClick={() => setEditingName(true)}
                title="Rename"
              >
                ✏️
              </button>
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {error && <div className="text-red-400 text-center text-xs">{error}</div>}
          {messages.length === 0 && !error && (
            <div className="text-gray-400 text-center mt-8">Start the conversation…</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${msg.sender === 'user' ? 'bg-purple-100 text-purple-900' : 'bg-gray-100 text-gray-700'}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="flex items-center gap-2 p-4 border-t"
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Type your message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading || !session}
            autoFocus
          />
          <button
            type="submit"
            className="bg-purple-500 text-white rounded-xl px-4 py-2 font-medium hover:bg-purple-600 transition disabled:opacity-50"
            disabled={loading || !session}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default NewChat
