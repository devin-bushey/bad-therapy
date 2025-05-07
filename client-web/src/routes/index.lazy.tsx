import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createLazyFileRoute('/')({
  component: Home,
})

type Session = { id: string; name?: string }

const NUM_RECENT_SESSIONS = 5

function RecentSessions() {
  const { data, isLoading, isError } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/sessions?limit=${NUM_RECENT_SESSIONS}`)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      return await res.json()
    },
  })

  return (
    <div className="min-h-[120px] flex items-center justify-center">
      {isLoading && <div className="text-xs text-zinc-400">Loading sessions…</div>}
      {isError && <div className="text-xs text-red-400">Could not load sessions.</div>}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="text-xs text-zinc-400">No recent sessions.</div>
      )}
      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="space-y-1 mt-1 w-full">
          {data.slice(0, NUM_RECENT_SESSIONS).map((session) => (
            <li key={session.id}>
              <Link
                to="/chat"
                search={{ sessionId: session.id }}
                className="block text-sm text-zinc-200 truncate bg-zinc-800 rounded px-2 py-1 hover:bg-purple-900/40 transition"
              >
                {session.name || session.id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center py-6 px-2">
      <div className="w-full max-w-4xl bg-zinc-800 rounded-3xl shadow-xl p-6 flex flex-col items-center h-[95vh">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-4xl">🧠</span>
          <span className="text-2xl font-bold text-purple-400">Bad Therapy</span>
        </div>
        <h1 className="text-lg font-semibold mb-1 text-center text-zinc-100">Hey, ready to vent?</h1>
        <p className="text-zinc-400 mb-6 text-center text-sm">Your judgement-free AI therapist is here 24/7</p>
        <div className="flex gap-4 w-full mb-8">
          <Link to="/chat" className="flex-1 flex flex-col items-center bg-purple-900/40 rounded-2xl py-5 shadow hover:bg-purple-800/60 transition cursor-pointer">
            <span className="text-purple-300 text-2xl mb-1">💬</span>
            <span className="font-medium text-purple-300">New Chat</span>
            <span className="text-xs text-zinc-400">Start fresh</span>
          </Link>
          <button className="flex-1 flex flex-col items-center bg-purple-900/40 rounded-2xl py-5 shadow hover:bg-purple-800/60 transition">
            <span className="text-purple-300 text-2xl mb-1">💡</span>
            <span className="font-medium text-purple-300">CBT Exercise</span>
            <span className="text-xs text-zinc-400">Reframe thoughts</span>
          </button>
        </div>
        <div className="w-full">
          <h2 className="font-semibold text-base mb-2 text-zinc-200">Recent Sessions</h2>
          <RecentSessions />
          <div className="bg-red-900/40 border border-red-800 rounded-2xl p-4 mb-2 shadow-sm mt-4">
            <div className="font-semibold text-red-400 mb-1">Should you use this?</div>
            <div className="text-zinc-100 font-medium mb-1 text-sm">If you're battling real trauma, you need a human. Don't mess around with your mental health.</div>
            <div className="text-xs text-zinc-500">But if you're mildly anxious and your idea of therapy involves a highly questionable trust in AI, then Bad Therapy might be for you.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
