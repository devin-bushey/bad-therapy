import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { Message, TherapySession } from '../../../types/session.types'
import { fetchSession, patchSessionName, streamAIMessage } from '../services/chat_services'

export function useChatSession(sessionId?: string) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [session, setSession] = useState<TherapySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const didInit = useRef(false)

  const loadSession = useCallback(async () => {
    if (!isAuthenticated || !sessionId) return
    setLoading(true)
    const token = await getAccessTokenSilently()
    const s = await fetchSession({ sessionId, token })
    setSession(s)
    setNameInput(s.name || 'Untitled')
    const messages = Array.isArray(s.messages) ? s.messages : []
    const filteredMessages = messages.filter(message => message.content !== '')
    setMessages(filteredMessages)
    setLoading(false)
  }, [isAuthenticated, sessionId, getAccessTokenSilently])

  const sendAIMessage = useCallback(async (prompt: string) => {
    if (!sessionId) return
    setLoading(true)
    const token = await getAccessTokenSilently()
    setMessages(msgs => [...msgs, { content: prompt, isFromUser: true }])
    setMessages(msgs => [...msgs, { content: '', isFromUser: false }])
    await streamAIMessage({
      sessionId,
      token,
      prompt,
      onChunk: aiMsg => setMessages(msgs => {
        const last = msgs[msgs.length - 1]
        if (!last || last.isFromUser) return [...msgs, { content: aiMsg, isFromUser: false }]
        return [...msgs.slice(0, -1), { content: aiMsg, isFromUser: false }]
      })
    })
    setLoading(false)
  }, [sessionId, getAccessTokenSilently])

  const saveName = useCallback(async (name: string) => {
    if (!sessionId) return
    const token = await getAccessTokenSilently()
    const s = await patchSessionName({ sessionId, token, name })
    setSession(s)
    setNameInput(s.name || 'Untitled')
  }, [sessionId, getAccessTokenSilently])

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    if (didInit.current) return
    if (!sessionId || !isAuthenticated) return
    if (!session) return
    if (Array.isArray(session.messages) && session.messages.length === 0) {
      didInit.current = true
      sendAIMessage('')
    }
  }, [session, sessionId, isAuthenticated, sendAIMessage])

  useEffect(() => {
    if (messages.length === 5) loadSession()
  }, [messages.length])

  return {
    messages,
    setMessages,
    session,
    loading,
    nameInput,
    setNameInput,
    loadSession,
    sendAIMessage,
    saveName
  }
} 