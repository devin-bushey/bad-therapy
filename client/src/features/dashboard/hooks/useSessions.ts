import { useState, useEffect } from 'react'
import { fetchSessions } from '../services/sessionServices'
import type { TherapySession } from '../../../types/session.types'

export function useSessions(isAuthenticated: boolean, getAccessTokenSilently: () => Promise<string>) {
    const [sessions, setSessions] = useState<TherapySession[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) return
        setLoading(true)
        getAccessTokenSilently().then(token => {
            fetchSessions(token)
                .then(setSessions)
                .catch(() => setSessions([]))
                .finally(() => setLoading(false))
        })
    }, [isAuthenticated, getAccessTokenSilently])

    return { sessions, loading }
} 