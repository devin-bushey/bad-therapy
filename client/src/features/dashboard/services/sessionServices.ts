import type { TherapySession } from '../../../types/session.types'


const API_URL = import.meta.env.VITE_SERVER_DOMAIN


export async function fetchSessions(token: string): Promise<TherapySession[]> {
    const res = await fetch(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    return res.json()
}

export async function createSession(token: string, name: string, userId: string): Promise<TherapySession> {
    const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, user_id: userId })
    })
    if (!res.ok) throw new Error('Failed to create session')
    return res.json()
}

export async function deleteSession(token: string, sessionId: string): Promise<void> {
    await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })
} 