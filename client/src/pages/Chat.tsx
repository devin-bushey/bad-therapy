import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useSearchParams, useNavigate } from 'react-router-dom'

type Message = { content: string; isFromUser: boolean }

type Session = { id: string; name?: string; messages?: Message[] }

export default function Chat() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') || undefined
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [autoScroll, setAutoScroll] = useState(true)

  const handleScroll = () => {
    if (!chatRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40)
  }

  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const loadSession = useCallback(async () => {
    if (!isAuthenticated || !sessionId) return
    setLoading(true)
    const token = await getAccessTokenSilently()
    const res = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const s = await res.json()
    setSession(s)
    setNameInput(s.name || 'Untitled')
    setMessages(Array.isArray(s.messages) ? s.messages : [])
    setLoading(false)
  }, [isAuthenticated, sessionId, getAccessTokenSilently])

  const streamAIMessage = useCallback(async (prompt: string) => {
    if (!sessionId) return
    setLoading(true)
    const token = await getAccessTokenSilently()
    const res = await fetch('http://localhost:8000/ai/generate-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ session_id: sessionId, prompt })
    })
    if (!res.body) return
    const reader = res.body.getReader()
    let aiMsg = ''
    setMessages(msgs => [...msgs, { content: '', isFromUser: false }])
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      aiMsg += new TextDecoder().decode(value)
      setMessages(msgs => {
        const last = msgs[msgs.length - 1]
        if (!last || last.isFromUser) return [...msgs, { content: aiMsg, isFromUser: false }]
        return [...msgs.slice(0, -1), { content: aiMsg, isFromUser: false }]
      })
    }
    setLoading(false)
  }, [sessionId, getAccessTokenSilently])

  const refreshSessionName = useCallback(async () => {
    if (!sessionId) return
    const token = await getAccessTokenSilently()
    const updated = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (updated.ok) {
      const s = await updated.json()
      setSession(s)
      setNameInput(s.name || '')
    }
  }, [sessionId, getAccessTokenSilently])

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    if (!isAuthenticated || !sessionId) return
    if (messages.length !== 0) return
    if (session && Array.isArray(session.messages) && session.messages.length === 0) {
      streamAIMessage('')
    }
  }, [isAuthenticated, sessionId, messages.length, session, streamAIMessage])

  const send = async () => {
    if (!input.trim() || !sessionId) return
    setMessages(msgs => [...msgs, { content: input, isFromUser: true }])
    setInput('')
    await streamAIMessage(input)
    if (messages.length === 4) await refreshSessionName()
  }

  const saveName = async () => {
    if (!sessionId) return
    const token = await getAccessTokenSilently()
    const res = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: nameInput })
    })
    const s = await res.json()
    setSession(s)
    setNameInput(s.name || 'Untitled')
    setEditing(false)
  }

  return (
    <div style={{ height: '90vh', background: '#181824', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 600, marginTop: 24, marginBottom: 8, textAlign: 'left' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 8, padding: 0 }}>&larr; Back</button>
      </div>
      <div style={{ width: '100%', maxWidth: 600, marginBottom: 8, textAlign: 'center' }}>
        {editing ? (
          <form onSubmit={e => { e.preventDefault(); saveName() }} style={{ display: 'inline-block' }}>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
              style={{ fontSize: 22, fontWeight: 700, background: '#23233a', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}
              onBlur={saveName}
            />
          </form>
        ) : (
          <span
            style={{ fontSize: 22, fontWeight: 700, color: '#fff', cursor: 'pointer', background: '#23233a', borderRadius: 8, padding: '4px 12px' }}
            onClick={() => setEditing(true)}
          >
            {session?.name || 'Untitled'}
          </span>
        )}
      </div>
      <div
        ref={chatRef}
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 600,
          height: 400,
          overflowY: 'auto',
          margin: '2rem 0',
          background: '#23233a',
          borderRadius: 12,
          padding: 24,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onScroll={handleScroll}
        className="hide-scrollbar"
      >
        {loading && messages.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 18, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading messages…
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ textAlign: m.isFromUser ? 'right' : 'left', margin: '12px 0' }}>
              <span style={{
                display: 'inline-block',
                background: m.isFromUser ? '#2563eb' : '#282846',
                color: '#fff',
                borderRadius: 16,
                padding: '10px 18px',
                maxWidth: '80%',
                wordBreak: 'break-word',
                whiteSpace: 'pre-line'
              }}>
                {m.content.split('\n').map((line, idx, arr) => idx < arr.length - 1 ? <span key={idx}>{line}<br /></span> : line)}
              </span>
            </div>
          ))
        )}
      </div>
      <form style={{ display: 'flex', width: '100%', maxWidth: 600, margin: '0 auto 2rem auto' }} onSubmit={e => { e.preventDefault(); send() }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message…"
          style={{ flex: 1, padding: 14, borderRadius: 8, border: 'none', fontSize: 16, background: '#181824', color: '#fff' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ marginLeft: 8 }}>Send</button>
      </form>
    </div>
  )
}
