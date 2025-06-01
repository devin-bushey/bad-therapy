import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useChatSession } from './hooks/useChatSession'
import { useSuggestFollowupPrompts } from './hooks/useSuggestFollowupPrompts'
import { ChatMessages } from './components/ChatMessages'
import { ChatInput } from './components/ChatInput'
import SuggestedPrompts from './components/SuggestedPrompts'

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
    saveName,
    initialSuggestedPrompts,
    setInitialSuggestedPrompts
  } = useChatSession(sessionId)
  const {
    suggestedPrompts,
    showSuggestions,
    setShowSuggestions,
    loading: followupSuggestionsLoading,
    handleLightbulbClick,
    handlePromptClick
  } = useSuggestFollowupPrompts(sessionId)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [autoScroll, setAutoScroll] = useState(true)

  // Show initial prompts from backend if available, else fallback
  const showInitialSuggestedPrompts =
    messages.length === 2 &&
    messages[0].type === 'human' &&
    messages[1].type !== 'human' &&
    messages[1].content &&
    !loading

  const initialPromptsToShow = initialSuggestedPrompts.length > 0 ? initialSuggestedPrompts : suggestedPrompts

  // Show follow-up suggestions if the lightbulb was clicked and suggestions are loaded
  const showFollowupSuggestions = showSuggestions && (suggestedPrompts.length > 0 || followupSuggestionsLoading)

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
    setShowSuggestions(false)
  }

  const handleSaveName = async () => {
    await saveName(nameInput)
    setEditing(false)
  }

  // Wrap sendAIMessage for prompt click
  const handlePromptClickWrapper = async (prompt: string) => {
    setInput('')
    await handlePromptClick(sendAIMessage, prompt)
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
          marginBottom: '10px',
          paddingBottom: 120
        }}
        onScroll={handleScroll}
      >
        <ChatMessages messages={messages} loading={loading} showTypingBubble={
          !loading && messages.length > 0 && messages[messages.length - 1].content === '' && messages[messages.length - 1].type !== 'human'
        } />
        {showInitialSuggestedPrompts && (
          <SuggestedPrompts
            prompts={initialPromptsToShow}
            onPromptClick={handlePromptClickWrapper}
            align="flex-end"
            loading={false}
          />
        )}
        {showFollowupSuggestions && (
          <SuggestedPrompts
            prompts={suggestedPrompts}
            onPromptClick={handlePromptClickWrapper}
            align="flex-end"
            loading={followupSuggestionsLoading}
          />
        )}
      </div>
      <div className="chat-input">
        <ChatInput
          input={input}
          onInput={setInput}
          onSend={handleSend}
          loading={loading}
          onLightbulbClick={handleLightbulbClick}
        />
      </div>
    </div>
  )
}
