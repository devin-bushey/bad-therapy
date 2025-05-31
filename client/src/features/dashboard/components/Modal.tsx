import { useEffect } from 'react'
import type { ReactNode } from 'react'

export default function Modal({ open, onClose, onConfirm, title, children }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  children?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#222', color: '#eee', padding: 24, borderRadius: 8, minWidth: 280, boxShadow: '0 2px 16px #0008' }} onClick={e => e.stopPropagation()}>
        {title && <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>}
        <div style={{ marginBottom: 16 }}>{children}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #444', color: '#eee', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: '#c00', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  )
} 