import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createLazyFileRoute('/')({
  component: Home,
})

type Session = { id: string; name?: string }

function RecentSessions() {
  const { data, isLoading, isError } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/sessions')
      if (!res.ok) throw new Error('Failed to fetch sessions')
      return await res.json()
    },
  })

  if (isLoading) return <div className="text-xs text-gray-400">Loading sessions…</div>
  if (isError) return <div className="text-xs text-red-400">Could not load sessions.</div>
  if (!data || data.length === 0) return <div className="text-xs text-gray-400">No recent sessions.</div>

  return (
    <ul className="space-y-1 mt-1">
      {data.slice(0, 5).map((session) => (
        <li key={session.id}>
          <Link
            to="/chat"
            search={{ sessionId: session.id }}
            className="block text-sm text-gray-700 truncate bg-gray-50 rounded px-2 py-1 hover:bg-purple-50 transition"
          >
            {session.name || session.id}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center py-6 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-4xl">🧠</span>
          <span className="text-2xl font-bold text-purple-600">Bad Therapy</span>
        </div>
        <h1 className="text-lg font-semibold mb-1 text-center">Hey, ready to vent?</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">Your judgement-free AI therapist is here 24/7</p>
        <div className="flex gap-4 w-full mb-8">
          <Link to="/chat" className="flex-1 flex flex-col items-center bg-purple-100 rounded-2xl py-5 shadow hover:bg-purple-200 transition cursor-pointer">
            <span className="text-purple-500 text-2xl mb-1">💬</span>
            <span className="font-medium text-purple-700">New Chat</span>
            <span className="text-xs text-gray-500">Start fresh</span>
          </Link>
          <button className="flex-1 flex flex-col items-center bg-purple-100 rounded-2xl py-5 shadow hover:bg-purple-200 transition">
            <span className="text-purple-500 text-2xl mb-1">💡</span>
            <span className="font-medium text-purple-700">CBT Exercise</span>
            <span className="text-xs text-gray-500">Reframe thoughts</span>
          </button>
        </div>
        <div className="w-full">
          <h2 className="font-semibold text-base mb-2">Recent Sessions</h2>
          <RecentSessions />
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-2 shadow-sm mt-4">
            <div className="font-semibold text-red-500 mb-1">Should you use this?</div>
            <div className="text-black font-medium mb-1 text-sm">If you're battling real trauma, you need a human. Don't mess around with your mental health.</div>
            <div className="text-xs text-gray-400">But if you're mildly anxious and your idea of therapy involves a highly questionable trust in AI, then Bad Therapy might be for you.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
