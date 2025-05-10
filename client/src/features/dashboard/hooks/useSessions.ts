import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '../services/sessionServices'
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