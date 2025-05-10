import type { TherapySession } from '../../../types/session.types'

export function SessionsTable({ sessions, loading }: { sessions: TherapySession[]; loading: boolean }) {
  return (
    <div style={{ height: 240, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#181824', borderRadius: 10, boxShadow: '0 1px 4px #a259e611' }}>
      {loading ? (
        <div style={{ color: '#bbb', textAlign: 'center', fontSize: 18 }}>Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', fontSize: 15 }}>No recent sessions</div>
      ) : (
        <table style={{ width: '100%' }}>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => window.location.href = `/chat?sessionId=${s.id}`}
                onMouseOver={e => (e.currentTarget.style.background = '#282846')}
                onMouseOut={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: 10, color: '#eee' }}>{s.name || 'Untitled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
