interface JournalPrompt {
  text: string
  title: string
}

export async function fetchJournalWritingPrompts({ token }: { token: string }): Promise<JournalPrompt[]> {
    const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/ai/journal-writing-prompts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch journal writing prompts')
    const data = await res.json()
    return data.prompts || []
  }