import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

export default function Navbar({ children }: { children?: ReactNode }) {
  const { logout } = useAuth0()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem 1rem 2rem' }}>
      <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>bad therapy</span>
      {children}
      <div ref={ref} style={{ position: 'relative' }}>
        <button style={{ background: '#23233a', color: '#fff', borderRadius: 24, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 16, border: 'none' }} onClick={() => setOpen(o => !o)}>
          Profile
        </button>
        {open && (
          <div style={{ position: 'absolute', right: 0, top: '110%', background: '#23233a', borderRadius: 12, boxShadow: '0 2px 8px #0003', minWidth: 140, zIndex: 10 }}>
            <button style={{ display: 'block', width: '100%', background: 'none', color: '#fff', border: 'none', padding: '0.7em 1.2em', textAlign: 'left', fontWeight: 500, cursor: 'pointer' }} onClick={() => { setOpen(false); navigate('/user') }}>Profile</button>
            <button style={{ display: 'block', width: '100%', background: 'none', color: '#ef4444', border: 'none', padding: '0.7em 1.2em', textAlign: 'left', fontWeight: 500, cursor: 'pointer' }} onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/' } })}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
} 