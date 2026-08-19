import { usePWA } from '../contexts/PWAContext'
import { RecurringIcon } from '../config/icons'

export default function UpdatePrompt() {
  const { updateAvailable, handleUpdate, dismissUpdate } = usePWA()

  if (!updateAvailable) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-[480px] mx-auto animate-scale-in">
      <div className="rounded-xl p-4 flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-teal) 20%, transparent)' }}>
          <RecurringIcon className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
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
