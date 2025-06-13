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
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4">
                <section className="text-center my-10 mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-white">
                        Welcome back!
                    </h1>
                    <div className="text-gray-400 text-lg mb-8">
                        Ready for your daily mental wellness check-in?
                    </div>
                    <div className="flex justify-center gap-3 mb-0">
                        <button
                            className="text-lg font-semibold bg-blue-600 text-white rounded-lg px-9 py-4 shadow-md border-none min-w-[180px] hover:bg-blue-700 transition-colors"
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
                            className="text-lg font-semibold bg-purple-600 text-white rounded-lg px-9 py-4 border border-purple-500 min-w-[180px] hover:bg-purple-700 hover:border-purple-600 transition-colors"
                            onClick={() => navigate('/journal')}
                        >
                            Journal
                        </button>
                    </div>
                </section>
                <section>
                    <h2 className="font-bold mb-3 text-white">Today's Mood</h2>
                    <DailyMoodTracker />
                </section>
                <TipsSection />
                <section>
                    <h2 className="font-bold mb-3 text-white">Recent Sessions</h2>
                    <div className="card">
                        <SessionsTable sessions={sessions} loading={loading} />
                    </div>
                </section>
                <section className="pb-3">
                    <h2 className="font-bold mb-3 text-white">Mood Tracker</h2>
                    <MoodTrendChart />
                </section>

            </main>
        </div>
    )
}
