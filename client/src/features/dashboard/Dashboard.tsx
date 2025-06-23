import { useAuth0 } from '@auth0/auth0-react'
import { SessionsTable } from './components/SessionsTable'
import { useNavigate } from 'react-router-dom'
import { createSession } from './services/sessionServices'
import { useSessions } from './hooks/useSessions'
import { BillingBanner, CheckoutStatusHandler } from '../billing'
import Navbar from '../../pages/Navbar'
import DailyMoodTracker from '../mood/components/DailyMoodTracker'
import MoodTrendChart from '../mood/components/MoodTrendChart'
import { TipsSection } from '../tips'
import { JournalEntriesTable } from '../journal/components/JournalEntriesTable'
import { useJournalEntries } from '../journal/hooks/useJournalEntries'

export default function Dashboard() {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
    const navigate = useNavigate()
    const { sessions, loading } = useSessions(isAuthenticated, getAccessTokenSilently)
    const { entries, loading: entriesLoading } = useJournalEntries(isAuthenticated, getAccessTokenSilently)

    return (
        <div className="min-h-screen bg-warm-50">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4">
                <section className="text-center my-10 mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-warm-800">
                        Welcome back!
                    </h1>
                    <div className="text-warm-600 text-lg mb-8">
                        Ready for your daily mental wellness check-in?
                    </div>
                    <div className="flex justify-center gap-3 mb-0">
                        <button
                            className="text-lg font-semibold bg-earth-500 text-warm-50 rounded-lg px-9 py-4 shadow-md border-none min-w-[180px] hover:bg-earth-600 transition-colors"
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
                            className="text-lg font-semibold bg-ai-500 text-warm-50 rounded-lg px-9 py-4 border border-ai-400 min-w-[180px] hover:bg-ai-600 hover:border-ai-500 transition-colors"
                            onClick={() => navigate('/journal')}
                        >
                            Journal
                        </button>
                    </div>
                </section>

                {/* Checkout Status Messages */}
                <CheckoutStatusHandler />

                {/* Billing Banner */}
                <BillingBanner />

                <section>
                    <h2 className="font-bold mb-3 text-warm-800">Today's Mood</h2>
                    <DailyMoodTracker />
                </section>
                <TipsSection />
                <section>
                    <h2 className="font-bold mb-3 text-warm-800">Recent Sessions</h2>
                    <div className="bg-warm-100 rounded-2xl shadow-lg p-8 mb-10 border border-warm-200">
                        <SessionsTable sessions={sessions} loading={loading} />
                    </div>
                </section>
                <section>
                    <h2 className="font-bold mb-3 text-warm-800">Recent Journal Entries</h2>
                    <div className="bg-warm-100 rounded-2xl shadow-lg p-8 mb-10 border border-warm-200">
                        <JournalEntriesTable entries={entries} loading={entriesLoading} />
                    </div>
                </section>
                <section className="mb-3">
                    <h2 className="font-bold mb-3 text-warm-800">Mood Tracker</h2>
                    <MoodTrendChart />
                </section>

                <footer className="mt-8 pt-6 border-t border-warm-200 pb-10">
                    <div className="text-center text-sm text-warm-500 space-x-4">
                        <a 
                            href="/terms" 
                            className="hover:text-warm-700 transition-colors underline"
                        >
                            Terms of Service
                        </a>
                        <span>•</span>
                        <a 
                            href="/privacy" 
                            className="hover:text-warm-700 transition-colors underline"
                        >
                            Privacy Policy
                        </a>
                    </div>
                    <div className="text-center text-xs text-warm-400 mt-2">
                        AI Mental Health Coach - Not a substitute for professional therapy
                    </div>
                </footer>

            </main>
        </div>
    )
}
