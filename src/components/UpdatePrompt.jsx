import { usePWA } from '../contexts/PWAContext'

export default function UpdatePrompt() {
  const { updateAvailable, handleUpdate, dismissUpdate } = usePWA()

  if (!updateAvailable) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-[480px] mx-auto animate-scale-in">
      <div className="rounded-xl p-4 flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(29, 158, 117, 0.2)' }}>
          <svg className="w-4 h-4" style={{ color: 'var(--color-teal)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>Nueva versión disponible</p>
        <div className="flex gap-2">
          <button
            onClick={dismissUpdate}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--color-muted)' }}
          >
            Ahora no
          </button>
          <button
            onClick={handleUpdate}
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-teal)' }}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}
