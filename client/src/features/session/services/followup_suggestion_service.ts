

export async function fetchFollowupSuggestions({ sessionId, token }: { sessionId: string; token: string }): Promise<string[]> {
    const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/ai/followup-suggestions?session_id=${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch follow-up suggestions')
    const data = await res.json()
    return data.suggestions || []
  } 