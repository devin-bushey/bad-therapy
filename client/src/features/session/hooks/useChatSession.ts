import { useCallback, useRef, useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { Message, TherapySession } from '../../../types/session.types'
import { fetchSession, patchSessionName, streamAIMessage } from '../services/chat_services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AIChunk } from '../services/chat_services'
import { useBillingContext } from '../../billing/contexts/BillingContext'

export function useChatSession(sessionId?: string, skipInitialMessage?: boolean) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()
  const { refetch: refetchBilling, isMessageLimitReached } = useBillingContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [nameInput, setNameInput] = useState('')
  const [initialSuggestedPrompts, setInitialSuggestedPrompts] = useState<string[]>([])
  const [messageLimitReached, setMessageLimitReached] = useState(false)
  const [limitErrorDetails, setLimitErrorDetails] = useState<{
    message?: string
    current_count?: number
    limit?: number
  } | null>(null)
  const didInit = useRef(false)
  const queryClient = useQueryClient()

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

  const sendAIMessage = useCallback(async (prompt: string, isTipMessage = false) => {
    if (!sessionId) return
    setMessages(msgs => [
      ...msgs,
      { content: prompt, type: 'human' },
      { content: '', type: 'ai' }
    ])
    try {
      const token = await getAccessTokenSilently()
      await streamAIMessage({
        sessionId,
        token,
        prompt,
        isTipMessage,
        onChunk: (chunk: AIChunk) => {
          if ('suggestedPrompts' in chunk) {
            setInitialSuggestedPrompts(chunk.suggestedPrompts)
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
      // Refresh billing data after message is sent to update message count
      try { await refetchBilling() } catch (e) { console.error('Failed to refresh billing data:', e) }
    } catch (error: unknown) {
      // Handle specific message limit error
      if (error && typeof error === 'object' && 'name' in error && error.name === 'MessageLimitError') {
        setMessageLimitReached(true)
        setLimitErrorDetails('details' in error ? error.details as { message?: string; current_count?: number; limit?: number } : null)
        setMessages(msgs => {
          // Remove the last (empty) ai message
          if (msgs.length > 0 && msgs[msgs.length - 1].type === 'ai' && msgs[msgs.length - 1].content === '') {
            return msgs.slice(0, -1)
          }
          return msgs
        })
      } else {
        // Handle other errors with generic message
        setMessages(msgs => {
          // Remove the last (empty) ai message and add error message
          if (msgs.length > 0 && msgs[msgs.length - 1].type === 'ai' && msgs[msgs.length - 1].content === '') {
            return [
              ...msgs.slice(0, -1),
              { content: 'Sorry, something went wrong. Please try again.', type: 'ai' }
            ]
          }
          return [
            ...msgs,
            { content: 'Sorry, something went wrong. Please try again.', type: 'ai' }
          ]
        })
      }
    }
  }, [sessionId, getAccessTokenSilently, messages.length, sessionQuery, refetchBilling])

  // Sync local message limit state with billing context
  useEffect(() => {
    if (isMessageLimitReached && !messageLimitReached) {
      setMessageLimitReached(true)
    }
  }, [isMessageLimitReached, messageLimitReached])

  // Initial AI message logic
  useEffect(() => {
    if (
      !didInit.current &&
      !skipInitialMessage &&
      sessionQuery.data &&
      Array.isArray(sessionQuery.data.messages) &&
      sessionQuery.data.messages.length === 0 &&
      sessionId &&
      isAuthenticated
    ) {
      didInit.current = true
      sendAIMessage('')
    }
  }, [sessionQuery.data, sessionId, isAuthenticated, sendAIMessage, skipInitialMessage])

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
    initialSuggestedPrompts,
    setInitialSuggestedPrompts,
    messageLimitReached,
    limitErrorDetails,
    setMessageLimitReached
  }
} 