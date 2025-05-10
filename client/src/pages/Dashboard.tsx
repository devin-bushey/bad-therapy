import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { SessionsTable } from '../components/SessionsTable'
import { useNavigate } from 'react-router-dom'

export type Session = { id: string; name?: string }

export default function Dashboard() {
    const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, logout, user } = useAuth0()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) return
        setLoading(true)
        getAccessTokenSilently().then(token => {
            fetch('http://localhost:8000/sessions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(setSessions)
                .catch(() => setSessions([]))
                .finally(() => setLoading(false))
        })
    }, [isAuthenticated, getAccessTokenSilently])

    const LoginComponent = () => (
        <button onClick={() => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin + '/dashboard' } })}>Login</button>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#181824' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem 1rem 2rem' }}>
                <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -1 }}>therabot</span>
                {isAuthenticated && (
                    <button style={{ background: '#23233a', color: '#fff', borderRadius: 24, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 16, border: 'none' }} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                        Logout
                    </button>
                )}
            </nav>
            <main style={{ maxWidth: 700, margin: '0 auto', padding: '0 1rem' }}>
                <section style={{ textAlign: 'center', margin: '2.5rem 0 2rem 0' }}>
                    <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
                        Welcome back{user?.name ? `, ${user.name}` : ''}.
                    </h1>
                    <div style={{ color: '#b3b3b3', fontSize: 18, marginBottom: 32 }}>
                        Ready for your daily mental wellness check-in?
                    </div>
                    {!isAuthenticated ? <LoginComponent /> : (
                        <button
                            style={{ fontSize: 18, fontWeight: 600, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '0.9em 2.2em', margin: '0 auto', display: 'block', boxShadow: '0 2px 8px #0002' }}
                            onClick={async () => {
                                const token = await getAccessTokenSilently()
                                const res = await fetch('http://localhost:8000/sessions', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ name: '' })
                                })
                                const session = await res.json()
                                navigate(`/chat?sessionId=${session.id}`)
                            }}
                        >
                            + Start New Session
                        </button>
                    )}
                </section>
                <section>
                    <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Recent Sessions</h2>
                    <div className="card">
                        <SessionsTable sessions={sessions} loading={loading} />
                    </div>
                </section>
                <section>
                    <div className="dashboard-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h2 style={{ fontWeight: 700, margin: 0 }}>Your Mood Pattern</h2>
                            <span style={{ color: '#b3b3b3', fontSize: 14 }}>Last 7 days</span>
                        </div>
                        <div style={{ color: '#b3b3b3', textAlign: 'center', padding: '2.5rem 0' }}>
                            {/* Mood chart placeholder */}
                            <span style={{ fontStyle: 'italic' }}>Mood chart coming soon…</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
