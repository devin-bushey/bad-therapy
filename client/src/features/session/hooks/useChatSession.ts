import { useCallback, useRef, useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { Message, TherapySession } from '../../../types/session.types'
import { fetchSession, patchSessionName, streamAIMessage } from '../services/chat_services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AIChunk } from '../services/chat_services'

export function useChatSession(sessionId?: string) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [nameInput, setNameInput] = useState('')
  const didInit = useRef(false)
  const queryClient = useQueryClient()
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])

  const sessionQuery = useQuery<TherapySession>({
    queryKey: ['session', sessionId, isAuthenticated],
    queryFn: async (): Promise<TherapySession> => {
      if (!isAuthenticated || !sessionId) throw new Error('Not authenticated or no sessionId')
      const token = await getAccessTokenSilently()
      return fetchSession({ sessionId, token })
    },
    enabled: !!sessionId && isAuthenticated
  })

  useEffect(() => {
    const s = sessionQuery.data
    if (!s) return
    setNameInput(s.name || 'Untitled')
    setMessages(Array.isArray(s.messages) ? s.messages : [])
  }, [sessionQuery.data])

  const patchNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!sessionId) throw new Error('No sessionId')
      const token = await getAccessTokenSilently()
      if (!user?.sub) throw new Error('No userId')
      return patchSessionName({ sessionId, token, name, userId: user.sub })
    },
    onSuccess: (s: TherapySession) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId, isAuthenticated] })
      setNameInput(s.name || 'Untitled')
    }
  })

  const sendAIMessage = useCallback(async (prompt: string) => {
    if (!sessionId) return
    setMessages(msgs => [
      ...msgs,
      { content: prompt, type: 'human' },
      { content: '', type: 'ai' }
    ])
    const token = await getAccessTokenSilently()
    await streamAIMessage({
      sessionId,
      token,
      prompt,
      onChunk: (chunk: AIChunk) => {
        if ('suggestedPrompts' in chunk) {
          setSuggestedPrompts(chunk.suggestedPrompts)
          return
        }
        if ('content' in chunk && chunk.type === 'ai') {
          setMessages(msgs => {
            const last = msgs[msgs.length - 1]
            if (!last || last.type === 'human') return [...msgs, { content: chunk.content, type: 'ai' }]
            return [...msgs.slice(0, -1), { content: chunk.content, type: 'ai' }]
          })
        }
      }
    })
    // Refetch session after 6th message to update session name
    if (messages.length + 2 === 6) {
      try { await sessionQuery.refetch() } catch (e) { console.error('Failed to refetch session:', e) }
    }
  }, [sessionId, getAccessTokenSilently, streamAIMessage, messages.length, sessionQuery])

  // Initial AI message logic
  useEffect(() => {
    if (
      !didInit.current &&
      sessionQuery.data &&
      Array.isArray(sessionQuery.data.messages) &&
      sessionQuery.data.messages.length === 0 &&
      sessionId &&
      isAuthenticated
    ) {
      didInit.current = true
      sendAIMessage('')
    }
  }, [sessionQuery.data, sessionId, isAuthenticated, sendAIMessage])

  return {
    messages,
    setMessages,
    session: sessionQuery.data,
    loading: sessionQuery.isPending,
    nameInput,
    setNameInput,
    loadSession: sessionQuery.refetch,
    sendAIMessage,
    saveName: (name: string) => patchNameMutation.mutateAsync(name),
    suggestedPrompts,
    setSuggestedPrompts
  }
} 