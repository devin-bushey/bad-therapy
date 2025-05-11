import { useNavigate } from 'react-router-dom';
import type { TherapySession } from '../../../types/session.types'

export function SessionsTable({ sessions, loading }: { sessions: TherapySession[]; loading: boolean }) {

  const navigate = useNavigate()
  
  return (
    <div style={{ height: 240, width: '100%', margin: '0 auto'}}>
        <table style={{ width: '100%' }}>
          <tbody>

            {loading && (
              <tr>
                <td style={{ padding: 10, color: '#bbb' }}>Loading sessions…</td>
              </tr>
            )}

            {!loading && sessions.length === 0 && (
              <tr>
                <td style={{ padding: 10, color: '#555' }}>No recent sessions</td>
              </tr>
            )}

            {sessions.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => navigate(`/chat?sessionId=${s.id}`)}
                onMouseOver={e => (e.currentTarget.style.background = '#282846')}
                onMouseOut={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: 10, color: '#eee' }}>{s.name || 'Untitled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}
