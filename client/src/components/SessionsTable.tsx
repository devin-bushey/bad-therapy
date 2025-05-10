import type { Session } from '../pages/Dashboard'

export function SessionsTable({ sessions, loading }: { sessions: Session[]; loading: boolean }) {
  return (
    <div style={{ height: 240, overflowY: 'auto', width: '100%' }}>
      {loading ? (
        <div style={{ color: '#bbb', textAlign: 'center', lineHeight: '240px', fontSize: 18 }}>Loading sessions…</div>
      ) : (
        <table style={{ width: '100%', background: '#181824', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px #a259e611', fontSize: 15 }}>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={2} style={{ color: '#555', padding: 12, textAlign: 'center' }}>No recent sessions</td></tr>
            )}
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
