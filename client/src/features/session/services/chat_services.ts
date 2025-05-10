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

export async function streamAIMessage({ sessionId, token, prompt, onChunk }: { sessionId: string; token: string; prompt: string; onChunk: (chunk: string) => void }): Promise<void> {
  const res = await fetch(`${API_URL}/ai/generate-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ session_id: sessionId, prompt })
  })
  if (!res.body) throw new Error('No response body')
  const reader = res.body.getReader()
  let aiMsg = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    aiMsg += new TextDecoder().decode(value)
    onChunk(aiMsg)
  }
} 