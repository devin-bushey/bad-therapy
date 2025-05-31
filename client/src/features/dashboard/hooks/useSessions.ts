import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSessions, deleteSession } from '../services/sessionServices'
import type { TherapySession } from '../../../types/session.types'

export function useSessions(isAuthenticated: boolean, getAccessTokenSilently: () => Promise<string>) {
  const query = useQuery<TherapySession[]>({
    queryKey: ['sessions', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return []
      const token = await getAccessTokenSilently()
      return fetchSessions(token)
    },
    enabled: isAuthenticated
  })
  return { sessions: query.data || [], loading: query.isPending }
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ token, sessionId }: { token: string, sessionId: string }) => {
      await deleteSession(token, sessionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
} 