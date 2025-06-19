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
  const initialPrompt = searchParams.get('initialPrompt')
  const {
    messages,
    session,
    loading,
    nameInput,
    setNameInput,
    sendAIMessage,
    saveName,
    initialSuggestedPrompts
  } = useChatSession(sessionId, !!initialPrompt)
  const {
    suggestedPrompts,
    showSuggestions: showFollowupSuggestions,
    setShowSuggestions,
    loading: followupSuggestionsLoading,
    handleLightbulbClick,
    handlePromptClick
  } = useSuggestFollowupPrompts(sessionId, sendAIMessage)
  
  // Scroll to bottom when suggestions appear
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }
  
  const handleLightbulbClickWithScroll = async () => {
    await handleLightbulbClick()
    setTimeout(scrollToBottom, 100) // Small delay to ensure suggestions have rendered
  }
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Show initial prompts from backend if available, else fallback
  const showInitialSuggestedPrompts =
    messages.length === 2 &&
    messages[0].type === 'human' &&
    messages[1].type !== 'human' &&
    messages[1].content &&
    !loading

  const initialPromptsToShow = initialSuggestedPrompts.length > 0 ? initialSuggestedPrompts : suggestedPrompts



  const handleSend = async () => {
    if (!input.trim() || !sessionId) return
    setInput('')
    setShowSuggestions(false)
    await sendAIMessage(input)
  }

  const handleSaveName = async () => {
    await saveName(nameInput)
    setEditing(false)
  }

  // Remove chat-active class usage - now handled by pure Tailwind layout

  // Auto-send initial prompt from URL parameter
  useEffect(() => {
    if (initialPrompt && sessionId && messages.length === 0 && !loading) {
      sendAIMessage(decodeURIComponent(initialPrompt), true)
    }
  }, [initialPrompt, sessionId, messages.length, loading, sendAIMessage])

  return (
    <div className="flex flex-col items-center w-screen h-screen bg-slate-900 overflow-hidden" style={{ 
      /* Prevent body scrolling only in chat - support safe areas */
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)'
    }}>
      {/* Fixed header - always visible at top */}
      <div className="flex items-center w-full max-w-[600px] px-4 gap-2 text-left overflow-hidden flex-shrink-0 h-16 sm:px-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-transparent text-blue-400 border-none text-base p-0 min-w-[48px] hover:text-blue-300 transition-colors"
        >
          Back
        </button>
        {editing ? (
          <form onSubmit={e => { e.preventDefault(); handleSaveName() }} className="flex-1 flex items-center gap-1">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
              className="text-lg font-bold text-white border-none rounded-lg py-1 px-3 text-left flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ backgroundColor: 'rgb(40, 40, 70)' }}
              maxLength={64}
              onBlur={handleSaveName}
            />
            <button type="submit" className="text-sm px-2.5 py-1 bg-purple-600 text-white rounded-lg border-none hover:bg-purple-700 transition-colors">
              Save
            </button>
          </form>
        ) : (
          <span
            className="text-lg font-bold text-white rounded-lg py-1 px-3 whitespace-nowrap overflow-hidden text-ellipsis flex-1 cursor-pointer transition-colors"
            style={{ backgroundColor: 'rgb(40, 40, 70)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(50, 50, 80)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(40, 40, 70)'}
            onClick={() => setEditing(true)}
            title={session?.name || 'Untitled'}
          >
            {session?.name || 'Untitled'}
          </span>
        )}
      </div>
      
      {/* Scrollable chat messages area - fills remaining space */}
      <div
        ref={chatRef}
        className="w-full max-w-[600px] overflow-y-auto rounded-xl p-6 relative flex flex-col scrollbar-hide"
        style={{
          backgroundColor: 'rgb(35, 35, 58)',
          height: 'calc(100vh - 64px - 80px)', /* viewport - header - input */
          /* Ensure scrollbar is hidden on all browsers */
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
          touchAction: 'pan-y', /* Allow only vertical scrolling on mobile */
        }}
      >
        <ChatMessages messages={messages} loading={loading} showTypingBubble={
          !loading && messages.length > 0 && messages[messages.length - 1].content === '' && messages[messages.length - 1].type !== 'human'
        } />
        {!showFollowupSuggestions && showInitialSuggestedPrompts && (
          <SuggestedPrompts
            prompts={initialPromptsToShow}
            onPromptClick={handlePromptClick}
            align="flex-end"
            loading={false}
          />
        )}
        {showFollowupSuggestions && (
          <SuggestedPrompts
            prompts={suggestedPrompts}
            onPromptClick={handlePromptClick}
            align="flex-end"
            loading={followupSuggestionsLoading}
          />
        )}
      </div>
      
      {/* Fixed input at bottom - always visible */}
      <div className="w-full bg-slate-900 z-50 py-3 px-4 flex justify-center items-center fixed bottom-0 h-20 shadow-lg">
        <ChatInput
          input={input}
          onInput={setInput}
          onSend={handleSend}
          loading={loading}
          onLightbulbClick={handleLightbulbClickWithScroll}
        />
      </div>
    </div>
  )
}
