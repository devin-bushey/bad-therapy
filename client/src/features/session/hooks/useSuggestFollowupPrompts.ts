import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchFollowupSuggestions } from '../services/followup_suggestion_service'

export function useSuggestFollowupPrompts(sessionId?: string, sendAIMessage?: (prompt: string) => Promise<void>) {
  const { getAccessTokenSilently } = useAuth0()
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLightbulbClick = async () => {
    setSuggestedPrompts([])
    setShowSuggestions(true)
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const prompts = await fetchFollowupSuggestions({ sessionId: sessionId!, token })
      setSuggestedPrompts(prompts ?? [])
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = async (prompt: string) => {
    setSuggestedPrompts([])
    setShowSuggestions(false)
    if (sendAIMessage) await sendAIMessage(prompt)
  }

  return {
    suggestedPrompts,
    setSuggestedPrompts,
    showSuggestions,
    setShowSuggestions,
    loading,
    handleLightbulbClick,
    handlePromptClick
  }
} 