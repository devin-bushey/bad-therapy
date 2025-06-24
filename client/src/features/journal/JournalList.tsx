import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJournalEntries, useCreateJournalEntry, useGenerateJournalInsights } from './hooks/useJournalEntries'
import { JournalEntriesTable } from './components/JournalEntriesTable'
import type { JournalInsightsResponse } from './services/journalEntriesService'

export default function JournalList() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const { entries, loading } = useJournalEntries(isAuthenticated, getAccessTokenSilently)
  const createEntry = useCreateJournalEntry()
  const generateInsights = useGenerateJournalInsights()
  const [insights, setInsights] = useState<JournalInsightsResponse | null>(null)
  const [showInsights, setShowInsights] = useState(false)

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
      const result = await generateInsights.mutateAsync({ token, limit: 10 })
      setInsights(result)
      setShowInsights(true)
    } catch (error) {
      console.error('Failed to generate insights:', error)
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
              disabled={generateInsights.isPending}
              className="bg-ai-500 text-warm-50 rounded-lg px-6 py-3 border-none font-semibold hover:bg-ai-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateInsights.isPending ? 'Generating...' : 'Generate Insights'}
            </button>
          </div>
        </div>

        <div className="bg-warm-100 rounded-2xl shadow-lg p-8 border border-warm-200">
          <JournalEntriesTable entries={entries} loading={loading} />
        </div>

        {/* Insights Section */}
        {showInsights && insights && (
          <div className="bg-ai-50 rounded-2xl shadow-lg p-8 border border-ai-200 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ai-800">AI Insights</h2>
              <button
                onClick={() => setShowInsights(false)}
                className="text-ai-600 hover:text-ai-800 transition-colors text-lg"
                title="Close insights"
              >
                ×
              </button>
            </div>
            <div className="text-ai-700 leading-relaxed whitespace-pre-line">
              {insights.insights}
            </div>
            <div className="text-ai-600 text-sm mt-4">
              Based on analysis of {insights.entries_analyzed} journal {insights.entries_analyzed === 1 ? 'entry' : 'entries'}
            </div>
          </div>
        )}

        {/* Error state for insights */}
        {generateInsights.isError && (
          <div className="bg-error-50 rounded-2xl shadow-lg p-8 border border-error-200 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-error-800">Error</h2>
              <button
                onClick={() => generateInsights.reset()}
                className="text-error-600 hover:text-error-800 transition-colors text-lg"
                title="Close error"
              >
                ×
              </button>
            </div>
            <div className="text-error-700">
              Failed to generate insights. Please try again.
            </div>
            <button
              onClick={handleGenerateInsights}
              className="mt-4 bg-error-500 text-warm-50 rounded-lg px-4 py-2 border-none font-semibold hover:bg-error-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

      </div>
    </div>
  )
}