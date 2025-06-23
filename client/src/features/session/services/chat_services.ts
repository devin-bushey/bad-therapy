import type { TherapySession } from '../../../types/session.types'

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export async function fetchSession({ sessionId, token }: { sessionId: string; token: string }): Promise<TherapySession> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch session')
  return res.json()
}

export async function patchSessionName({ sessionId, token, name, userId }: { sessionId: string; token: string; name: string; userId: string }): Promise<TherapySession> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, user_id: userId })
  })
  if (!res.ok) throw new Error('Failed to update session name')
  return res.json()
}

// Define a type for the chunk
export type AIChunk = { content: string; type: 'ai' } | { suggestedPrompts: string[] }

export async function streamAIMessage({ sessionId, token, prompt, onChunk, isTipMessage = false }: { sessionId: string; token: string; prompt: string; onChunk: (chunk: AIChunk) => void; isTipMessage?: boolean }): Promise<void> {
  const res = await fetch(`${API_URL}/ai/generate-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ session_id: sessionId, prompt, is_tip_message: isTipMessage })
  })
  
  // Check for HTTP errors before trying to read stream
  if (!res.ok) {
    let errorData
    try {
      errorData = await res.json()
    } catch {
      errorData = { message: 'Unknown error occurred' }
    }
    
    // Create specific error types based on status code
    if (res.status === 402) {
      const error = new Error('MESSAGE_LIMIT_REACHED') as Error & { details: typeof errorData }
      error.name = 'MessageLimitError'
      error.details = errorData
      throw error
    } else {
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`)
    }
  }
  
  if (!res.body) throw new Error('No response body')
  const reader = res.body.getReader()
  let aiMsg = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = new TextDecoder().decode(value)
    // Split out suggested prompts JSON if present
    const match = chunk.match(/\{ *"suggested_prompts" *: *\[.*\]\s*\}/s)
    if (match) {
      try {
        const obj = JSON.parse(match[0])
        onChunk({ suggestedPrompts: obj.suggested_prompts })
      } catch {
        const default_prompts = [
          "I'm new to therapy and would like to start by sharing what brought me here.",
          "I've been feeling overwhelmed lately and want to explore ways to manage my stress.",
          "I want to understand more about my relationships and how they affect my well-being."
        ]
        onChunk({ suggestedPrompts: default_prompts })
      }
      // Remove the JSON from the chunk to get just the text
      const text = chunk.replace(match[0], '').trim()
      if (text) {
        aiMsg += text
        onChunk({ content: aiMsg, type: 'ai' })
      }
      continue
    }
    aiMsg += chunk
    onChunk({ content: aiMsg, type: 'ai' })
  }
}