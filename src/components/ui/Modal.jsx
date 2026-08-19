import { useEffect } from 'react'
import { CloseIcon } from '../../config/icons'

export default function Modal({ open, onClose, children, titulo }) {
  // Escape para cerrar y bloqueo del scroll de fondo: sin esto, el listado de
  // detras se desplazaba al hacer scroll dentro del modal en movil.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowPrevio
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full rounded-t-2xl p-6 animate-slide-up border-t overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center justify-between mb-6">
          {titulo && <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{titulo}</h2>}
          <button onClick={onClose} className="ml-auto p-1 transition-colors" style={{ color: 'var(--color-muted)' }} aria-label="Cerrar">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
