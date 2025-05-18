const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export async function saveJournal(content: object, token: string): Promise<Response> {
  return fetch(`${API_URL}/journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
    credentials: 'include',
  })
}

export async function fetchJournal(token: string): Promise<{ content: unknown }> {
  const res = await fetch(`${API_URL}/journal`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch journal')
  return res.json()
} 