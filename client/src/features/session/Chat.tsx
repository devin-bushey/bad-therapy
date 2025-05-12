import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useChatSession } from './hooks/useChatSession'
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

  // Suggested prompts to show after first AI message
  const suggestedPrompts = [
    "I don't know where to start",
    "Can you help me understand what I might get out of therapy?",
    "I'm not sure how I feel today",
  ]

  // Show prompts only after first AI message is done streaming
  const showSuggestedPrompts =
    messages.length === 2 &&
    messages[0].isFromUser &&
    !messages[1].isFromUser &&
    messages[1].content &&
    !loading

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

  const handlePromptClick = async (prompt: string) => {
    setInput('')
    await sendAIMessage(prompt)
  }

  useEffect(() => {
    document.body.classList.add('chat-active')
    document.documentElement.classList.add('chat-active')
    return () => {
      document.body.classList.remove('chat-active')
      document.documentElement.classList.remove('chat-active')
    }
  }, [])

  return (
    <div className="chat-container" style={{ height: '100dvh', background: '#181824', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw', maxWidth: '100vw', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', marginTop: 24, marginBottom: 8, textAlign: 'left', gap: 8, overflow: 'hidden' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', color: '#60a5fa', border: 'none', fontSize: 16, cursor: 'pointer', padding: 0, minWidth: 48 }}>Back</button>
        {editing ? (
          <form onSubmit={e => { e.preventDefault(); handleSaveName() }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
              style={{ fontSize: 22, fontWeight: 700, background: '#23233a', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', textAlign: 'left', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              maxLength={64}
              onBlur={handleSaveName}
            />
            <button type="submit" style={{ fontSize: 16, padding: '4px 10px', background: '#2563eb', color: '#fff', borderRadius: 8 }}>Save</button>
          </form>
        ) : (
          <span
            style={{ fontSize: 22, fontWeight: 700, color: '#fff', background: '#23233a', borderRadius: 8, padding: '4px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, cursor: 'pointer' }}
            onClick={() => setEditing(true)}
            title={session?.name || 'Untitled'}
          >
            {session?.name || 'Untitled'}
          </span>
        )}
      </div>
      <div
        ref={chatRef}
        className="chat-messages hide-scrollbar"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 600,
          overflowY: 'auto',
          background: '#23233a',
          borderRadius: 12,
          padding: 24,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          marginBottom: showSuggestedPrompts ? '10px' : 40
        }}
        onScroll={handleScroll}
      >
        <ChatMessages messages={messages} loading={loading} showTypingBubble={
          !loading && messages.length > 0 && messages[messages.length - 1].content === '' && !messages[messages.length - 1].isFromUser
        } />
        {showSuggestedPrompts && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-start', margin: '12px 0 60px 0' }}>
            {suggestedPrompts.map(p => (
              <button
                key={p}
                onClick={() => handlePromptClick(p)}
                style={{
                  display: 'inline-block',
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '10px 18px',
                  maxWidth: '80%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  margin: '6px 0',
                  fontSize: 'inherit',
                  textAlign: 'left',
                  fontWeight: 500,
                  boxShadow: '0 1px 4px 0 #0002',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chat-input">
        <ChatInput
          input={input}
          onInput={setInput}
          onSend={handleSend}
          loading={loading}
        />
      </div>
    </div>
  )
}
