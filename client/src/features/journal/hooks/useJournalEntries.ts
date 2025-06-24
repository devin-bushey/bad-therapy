import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJournalEntries, fetchJournalEntry, createJournalEntry, updateJournalEntry, deleteJournalEntry, generateJournalInsights, type JournalInsightsResponse } from '../services/journalEntriesService'
import type { JournalEntry } from '../../../types/journal-entries.types'

export function useJournalEntries(isAuthenticated: boolean, getAccessTokenSilently: () => Promise<string>) {
  const query = useQuery<JournalEntry[]>({
    queryKey: ['journal-entries', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return []
      const token = await getAccessTokenSilently()
      return fetchJournalEntries(token)
    },
    enabled: isAuthenticated
  })
  return { entries: query.data || [], loading: query.isPending }
}

export function useJournalEntry(entryId: string, isAuthenticated: boolean, getAccessTokenSilently: () => Promise<string>) {
  const query = useQuery<JournalEntry>({
    queryKey: ['journal-entry', entryId, isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error('Not authenticated')
      const token = await getAccessTokenSilently()
      return fetchJournalEntry(token, entryId)
    },
    enabled: isAuthenticated && !!entryId
  })
  return { entry: query.data, loading: query.isPending, error: query.error }
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ token, title, content }: { token: string, title: string, content: object }) => {
      return createJournalEntry(token, title, content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    }
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ token, entryId, title, content }: { token: string, entryId: string, title: string, content: object }) => {
      return updateJournalEntry(token, entryId, title, content)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entry', data.id] })
    }
  })
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ token, entryId }: { token: string, entryId: string }) => {
      await deleteJournalEntry(token, entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    }
  })
}

export function useGenerateJournalInsights() {
  return useMutation({
    mutationFn: async ({ token, limit }: { token: string, limit?: number }): Promise<JournalInsightsResponse> => {
      return generateJournalInsights(token, limit)
    }
  })
}