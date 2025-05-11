import { useAuth0 } from '@auth0/auth0-react'
import { SessionsTable } from './components/SessionsTable'
import { useNavigate } from 'react-router-dom'
import { createSession } from './services/sessionServices'
import { useSessions } from './hooks/useSessions'
import { useState, useRef, useEffect } from 'react'
import Navbar from './components/Navbar'

export default function Dashboard() {
    const { isAuthenticated, getAccessTokenSilently, logout, user } = useAuth0()
    const navigate = useNavigate()
    const { sessions, loading } = useSessions(isAuthenticated, getAccessTokenSilently)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div style={{ minHeight: '100vh', background: '#181824' }}>
            <Navbar />
            <main style={{ maxWidth: 700, margin: '0 auto', padding: '0 1rem' }}>
                <section style={{ textAlign: 'center', margin: '2.5rem 0 2rem 0' }}>
                    <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
                        Welcome back
                    </h1>
                    <div style={{ color: '#b3b3b3', fontSize: 18, marginBottom: 32 }}>
                        Ready for your daily mental wellness check-in?
                    </div>
                    <button
                        style={{ fontSize: 18, fontWeight: 600, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '0.9em 2.2em', margin: '0 auto', display: 'block', boxShadow: '0 2px 8px #0002' }}
                        onClick={async () => {
                            const token = await getAccessTokenSilently()
                            if (!user || !user.sub) return
                            const session = await createSession(token, 'New Session', user.sub)
                            navigate(`/chat?sessionId=${session.id}`)
                        }}
                    >
                        Start New Session
                    </button>
                </section>
                <section>
                    <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Recent Sessions</h2>
                    <div className="card">
                        <SessionsTable sessions={sessions} loading={loading} />
                    </div>
                </section>
                
            </main>
        </div>
    )
}
