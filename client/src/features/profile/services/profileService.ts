import type { ProfileForm } from '../../../types/profile.types'

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export const fetchProfile = async (token: string) => {
    const res = await fetch(`${API_URL}/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return null
    return res.json()
}

export const saveProfile = async ({ data, token }: { data: ProfileForm, token: string }) => {
    const res = await fetch(`${API_URL}/user/profile`, {
        method: data.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to save profile')
    return res.json()
} 