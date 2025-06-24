import type { JournalEntry } from '../../../types/journal-entries.types'

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export interface JournalInsightsResponse {
  insights: string
  entries_analyzed: number
}

export async function fetchJournalEntries(token: string): Promise<JournalEntry[]> {
    const res = await fetch(`${API_URL}/journal-entries`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    return res.json()
}

export async function createJournalEntry(token: string, title: string, content: object): Promise<JournalEntry> {
    const res = await fetch(`${API_URL}/journal-entries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    })
    if (!res.ok) throw new Error('Failed to create journal entry')
    return res.json()
}

export async function fetchJournalEntry(token: string, entryId: string): Promise<JournalEntry> {
    const res = await fetch(`${API_URL}/journal-entries/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch journal entry')
    return res.json()
}

export async function updateJournalEntry(token: string, entryId: string, title: string, content: object): Promise<JournalEntry> {
    const res = await fetch(`${API_URL}/journal-entries/${entryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    })
    if (!res.ok) throw new Error('Failed to update journal entry')
    return res.json()
}

export async function deleteJournalEntry(token: string, entryId: string): Promise<void> {
    await fetch(`${API_URL}/journal-entries/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })
}

export async function generateJournalInsights(token: string, limit: number = 10): Promise<JournalInsightsResponse> {
    const res = await fetch(`${API_URL}/ai/generate-journal-insights`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ limit })
    })
    if (!res.ok) throw new Error('Failed to generate journal insights')
    return res.json()
}