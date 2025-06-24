import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useJournalEntries, useCreateJournalEntry } from './hooks/useJournalEntries'
import { JournalEntriesTable } from './components/JournalEntriesTable'
import { useMutation } from '@tanstack/react-query'

// Function to create a new session
async function createSession(token: string, name: string) {
  const API_URL = import.meta.env.VITE_SERVER_DOMAIN
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  })
  if (!response.ok) throw new Error('Failed to create session')
  return response.json()
}

export default function JournalList() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const { entries, loading } = useJournalEntries(isAuthenticated, getAccessTokenSilently)
  const createEntry = useCreateJournalEntry()
  
  const createInsightsSession = useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      return createSession(token, 'Journal Insights')
    }
  })

  const handleCreateEntry = async () => {
    if (!isAuthenticated) return
    try {
      const token = await getAccessTokenSilently()
      const newEntry = await createEntry.mutateAsync({
        token,
        title: 'New Journal Entry',
        content: { type: 'doc', content: [] } // Empty TipTap content
      })
      navigate(`/journal/${newEntry.id}`)
    } catch (error) {
      console.error('Failed to create journal entry:', error)
    }
  }

  const handleGenerateInsights = async () => {
    if (!isAuthenticated) return
    try {
      const token = await getAccessTokenSilently()
      const session = await createInsightsSession.mutateAsync({ token })
      // Add a delay to ensure session is fully created
      await new Promise(resolve => setTimeout(resolve, 500))
      // Navigate to chat with the new session and automatically trigger insights
      navigate(`/chat?sessionId=${session.id}&insights=true`)
    } catch (error) {
      console.error('Failed to create insights session:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-warm-50 text-earth-500 text-xl font-semibold">
        Loading journal entries...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 hover:text-earth-600 transition-colors"
            >
              Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-warm-800 mb-6">Journal</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateEntry}
              disabled={createEntry.isPending}
              className="bg-earth-500 text-warm-50 rounded-lg px-6 py-3 border-none font-semibold hover:bg-earth-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEntry.isPending ? 'Creating...' : 'New Entry'}
            </button>
            <button
              onClick={handleGenerateInsights}
              disabled={createInsightsSession.isPending}
              className="bg-ai-500 text-warm-50 rounded-lg px-6 py-3 border-none font-semibold hover:bg-ai-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createInsightsSession.isPending ? 'Creating Session...' : 'Generate Insights'}
            </button>
          </div>
        </div>

        <div className="bg-warm-100 rounded-2xl shadow-lg p-8 border border-warm-200">
          <JournalEntriesTable entries={entries} loading={loading} />
        </div>

      </div>
    </div>
  )
}