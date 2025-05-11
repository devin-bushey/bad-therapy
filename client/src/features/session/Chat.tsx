import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useChatSession } from './hooks/useChatSession'
import { ChatHeader } from './components/ChatHeader'
import { ChatMessages } from './components/ChatMessages'
import { ChatInput } from './components/ChatInput'

export default function Chat() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') || undefined
  const {
    messages,
    session,
    loading,
    nameInput,
    setNameInput,
    sendAIMessage,
    saveName
  } = useChatSession(sessionId)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [autoScroll, setAutoScroll] = useState(true)

  const handleScroll = () => {
    if (!chatRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40)
  }

  useEffect(() => {
    if (autoScroll && chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, autoScroll])

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return
    setInput('')
    await sendAIMessage(input)
  }

  const handleSaveName = async () => {
    await saveName(nameInput)
    setEditing(false)
  }

  return (
    <div style={{ height: '90vh', background: '#181824', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 600, marginTop: 24, marginBottom: 8, textAlign: 'left' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 8, padding: 0 }}>&larr; Back</button>
      </div>
      <ChatHeader
        editing={editing}
        nameInput={nameInput}
        sessionName={session?.name}
        onEdit={() => setEditing(true)}
        onChange={setNameInput}
        onSave={handleSaveName}
        setEditing={setEditing}
      />
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
        <ChatMessages messages={messages} loading={loading} />
      </div>
      <ChatInput
        input={input}
        onInput={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </div>
  )
}
