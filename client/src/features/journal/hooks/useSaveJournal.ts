import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { saveJournal, fetchJournal } from '../services/saveJournal'

export function useSaveJournalMutation(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: object) => saveJournal(content, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal', token] })
  })
}

export function useJournalQuery(token: string) {
  return useQuery({
    queryKey: ['journal', token],
    queryFn: () => fetchJournal(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false
  })
} 