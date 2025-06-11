export interface ResourceLink {
    url: string
    title: string
    description?: string
    source_type: string
    credibility_score?: number
}

export interface DailyTip {
    content: string
    type: 'prompt' | 'info' | 'ai_guidance' | 'resource'
    link?: ResourceLink
    follow_up_prompts?: string[]
    technique_category?: string
    confidence_score?: number
}

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export async function fetchDailyTip(token: string): Promise<DailyTip> {
    const res = await fetch(`${API_URL}/tips/daily`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch daily tip')
    return res.json()
}