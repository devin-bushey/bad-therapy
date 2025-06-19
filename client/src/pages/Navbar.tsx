import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useEnhancedLogout } from '../auth/useEnhancedLogout'

export default function Navbar({ children }: { children?: ReactNode }) {
  const { logout } = useEnhancedLogout()
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
    <nav className="flex items-center justify-between px-8 pt-6 pb-4">
      <span 
        className="font-bold text-xl tracking-tight cursor-pointer text-white hover:text-gray-300 transition-colors"
        onClick={() => navigate('/dashboard')}
      >
        bad therapy
      </span>
      {children}
      <div ref={ref} className="relative">
        <button 
          className="bg-slate-600 text-white rounded-full px-5 py-2 font-semibold text-base border-none cursor-pointer hover:bg-slate-500 transition-colors"
          onClick={() => setOpen(o => !o)}
        >
          Profile
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 bg-slate-700 rounded-xl shadow-lg min-w-[140px] z-10">
            <button 
              className="block w-full bg-transparent text-white border-none py-3 px-5 text-left font-medium cursor-pointer hover:bg-slate-600 rounded-t-xl transition-colors"
              onClick={() => { setOpen(false); navigate('/user') }}
            >
              Profile
            </button>
            <button 
              className="block w-full bg-transparent text-red-400 border-none py-3 px-5 text-left font-medium cursor-pointer hover:bg-red-600 hover:text-white rounded-b-xl transition-colors"
              onClick={() => logout({ 
                returnTo: window.location.origin + '/' 
              })}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
} 