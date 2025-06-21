import { useAuth0 } from '@auth0/auth0-react'
import { SessionsTable } from './components/SessionsTable'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createSession } from './services/sessionServices'
import { useSessions } from './hooks/useSessions'
import { useBillingContext } from '../../contexts/BillingContext'
import Navbar from '../../pages/Navbar'
import DailyMoodTracker from '../mood/components/DailyMoodTracker'
import MoodTrendChart from '../mood/components/MoodTrendChart'
import { TipsSection } from '../tips'
import { useEffect, useState } from 'react'

export default function Dashboard() {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { sessions, loading } = useSessions(isAuthenticated, getAccessTokenSilently)
    const { billingData, loading: billingLoading, createCheckoutSession, openBillingPortal } = useBillingContext()
    const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'canceled' | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)

    // Handle Stripe checkout success/cancel - Following Stripe sample pattern
    useEffect(() => {
        const success = searchParams.get('success')
        const canceled = searchParams.get('canceled')
        const stripeSessionId = searchParams.get('session_id')

        if (success === 'true' && stripeSessionId) {
            setCheckoutStatus('success')
            setSessionId(stripeSessionId)
            // Clear URL params after processing
            window.history.replaceState({}, '', '/dashboard')
        } else if (canceled === 'true') {
            setCheckoutStatus('canceled')
            // Clear URL params after processing
            window.history.replaceState({}, '', '/dashboard')
        }
    }, [searchParams])

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

                {/* Checkout Success/Cancel Messages */}
                {checkoutStatus === 'success' && (
                    <section className="mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-green-800 font-medium mb-2">🎉 Subscription successful!</h3>
                            <p className="text-green-700 text-sm mb-3">
                                Welcome to Premium! You now have unlimited access to all features.
                            </p>
                            {sessionId && (
                                <button
                                    onClick={() => openBillingPortal(sessionId)}
                                    className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    Manage Subscription
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {checkoutStatus === 'canceled' && (
                    <section className="mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="text-yellow-800 font-medium mb-2">Checkout Canceled</h3>
                            <p className="text-yellow-700 text-sm">
                                No worries! You can upgrade to Premium anytime below.
                            </p>
                        </div>
                    </section>
                )}

                {/* Billing Banner */}
                {!billingLoading && (
                    <section className="mb-8">
                        {billingData && billingData.is_premium ? (
                            // Premium Status - Minimal
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-800 text-sm font-medium">
                                            ✨ Premium Plan Active
                                        </p>
                                        <p className="text-green-600 text-xs">
                                            Unlimited messages • $5/week
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openBillingPortal(billingData?.stripe_session_id)}
                                        className="text-green-600 hover:text-green-800 text-xs underline transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Free Trial - Minimal Banner
                            <div className="bg-warm-100 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-warm-800 text-sm">
                                            {billingData?.message_count || 0}/10 free messages used
                                        </p>
                                        <p className="text-warm-600 text-xs">
                                            Upgrade for unlimited • $5/week
                                        </p>
                                    </div>
                                    <button 
                                        onClick={createCheckoutSession}
                                        className="bg-earth-500 text-warm-50 px-3 py-1.5 rounded text-xs font-medium hover:bg-earth-600 transition-colors"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}

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
