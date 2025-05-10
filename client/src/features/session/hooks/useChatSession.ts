import { useCallback, useRef, useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { Message, TherapySession } from '../../../types/session.types'
import { fetchSession, patchSessionName, streamAIMessage } from '../services/chat_services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useChatSession(sessionId?: string) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [nameInput, setNameInput] = useState('')
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
      return patchSessionName({ sessionId, token, name })
    },
    onSuccess: (s: TherapySession) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId, isAuthenticated] })
      setNameInput(s.name || 'Untitled')
    }
  })

  const sendAIMessage = useCallback(async (prompt: string) => {
    if (!sessionId) return
    setMessages(msgs => [...msgs, { content: prompt, isFromUser: true }])
    setMessages(msgs => [...msgs, { content: '', isFromUser: false }])
    const token = await getAccessTokenSilently()
    await streamAIMessage({
      sessionId,
      token,
      prompt,
      onChunk: (aiMsg: string) => setMessages(msgs => {
        const last = msgs[msgs.length - 1]
        if (!last || last.isFromUser) return [...msgs, { content: aiMsg, isFromUser: false }]
        return [...msgs.slice(0, -1), { content: aiMsg, isFromUser: false }]
      })
    })
    queryClient.invalidateQueries({ queryKey: ['session', sessionId, isAuthenticated] })
  }, [sessionId, getAccessTokenSilently, queryClient, isAuthenticated])

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
    saveName: (name: string) => patchNameMutation.mutateAsync(name)
  }
} 