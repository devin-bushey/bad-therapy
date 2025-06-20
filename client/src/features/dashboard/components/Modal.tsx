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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-warm-100 border border-warm-200 text-warm-800 p-6 rounded-xl min-w-[280px] max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {title && <div className="font-semibold mb-3 text-lg text-warm-800">{title}</div>}
        <div className="mb-6 text-warm-700">{children}</div>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-200 hover:text-warm-800 rounded-lg px-4 py-2 cursor-pointer transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-error-500 hover:bg-error-600 border-none text-warm-50 rounded-lg px-4 py-2 cursor-pointer transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
} 