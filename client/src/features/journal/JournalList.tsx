import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useJournalEntries, useCreateJournalEntry } from './hooks/useJournalEntries'
import { JournalEntriesTable } from './components/JournalEntriesTable'

export default function JournalList() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const { entries, loading } = useJournalEntries(isAuthenticated, getAccessTokenSilently)
  const createEntry = useCreateJournalEntry()

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-transparent text-earth-500 border-none text-base cursor-pointer p-0 hover:text-earth-600 transition-colors mb-2"
            >
              Back
            </button>
            <h1 className="text-3xl font-bold text-warm-800">Journal</h1>
          </div>
          <button
            onClick={handleCreateEntry}
            disabled={createEntry.isPending}
            className="bg-earth-500 text-warm-50 rounded-lg px-6 py-3 border-none font-semibold hover:bg-earth-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createEntry.isPending ? 'Creating...' : 'New Entry'}
          </button>
        </div>

        <div className="bg-warm-100 rounded-2xl shadow-lg p-8 border border-warm-200">
          <JournalEntriesTable entries={entries} loading={loading} />
        </div>

      </div>
    </div>
  )
}