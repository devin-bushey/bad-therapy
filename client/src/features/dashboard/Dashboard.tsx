import { useAuth0 } from '@auth0/auth0-react'
import { SessionsTable } from './components/SessionsTable'
import { useNavigate } from 'react-router-dom'
import { createSession } from './services/sessionServices'
import { useSessions } from './hooks/useSessions'
import Navbar from '../../pages/Navbar'
import DailyMoodTracker from '../mood/components/DailyMoodTracker'
import MoodTrendChart from '../mood/components/MoodTrendChart'
import { TipsSection } from './components/TipsSection'

export default function Dashboard() {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
    const navigate = useNavigate()
    const { sessions, loading } = useSessions(isAuthenticated, getAccessTokenSilently)

    return (
        <div style={{ minHeight: '100vh', background: '#181824' }}>
            <Navbar />
            <main style={{ maxWidth: 700, margin: '0 auto', padding: '0 1rem' }}>
                <section style={{ textAlign: 'center', margin: '2.5rem 0 2rem 0' }}>
                    <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
                        Welcome back!
                    </h1>
                    <div style={{ color: '#b3b3b3', fontSize: 18, marginBottom: 32 }}>
                        Ready for your daily mental wellness check-in?
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 0 }}>
                        <button
                            style={{ fontSize: 18, fontWeight: 600, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '0.9em 2.2em', boxShadow: '0 2px 8px #0002', minWidth: 180 }}
                            onClick={async () => {
                                const token = await getAccessTokenSilently()
                                if (!user || !user.sub) return
                                const session = await createSession(token, 'New Session', user.sub)
                                navigate(`/chat?sessionId=${session.id}`)
                            }}
                        >
                            New Session
                        </button>
                        <button
                            style={{ fontSize: 18, fontWeight: 600, background: '#6366f1', color: '#fff', borderRadius: 8, padding: '0.9em 2.2em', boxShadow: '0 2px 8px #0002', border: 'none', minWidth: 180 }}
                            onClick={() => navigate('/journal')}
                        >
                            Journal
                        </button>
                    </div>
                </section>
                <section>
                    <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Today's Mood</h2>
                    <DailyMoodTracker />
                </section>
                <TipsSection />
                <section>
                    <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Recent Sessions</h2>
                    <div className="card">
                        <SessionsTable sessions={sessions} loading={loading} />
                    </div>
                </section>
                <section>
                    <MoodTrendChart />
                </section>
            </main>
        </div>
    )
}
