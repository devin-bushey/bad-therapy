import type { TherapySession } from '../../../types/session.types'

export async function fetchSessions(token: string): Promise<TherapySession[]> {
    const res = await fetch('http://localhost:8000/sessions', {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    return res.json()
}

export async function createSession(token: string, name: string, userId: string): Promise<TherapySession> {
    const res = await fetch('http://localhost:8000/sessions', {
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