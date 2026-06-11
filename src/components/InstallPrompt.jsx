import { usePWA } from '../contexts/PWAContext'

export default function InstallPrompt() {
  const { installPrompt, isInstalled, platform, manualGuide, handleInstall, dismissInstall, dismissManualGuide } = usePWA()

  if (isInstalled) return null

  if (installPrompt) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-[480px] mx-auto animate-slide-up">
        <div className="rounded-xl p-4 flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Instalar Taskway</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Agrega la app a tu pantalla de inicio</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={dismissInstall}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--color-muted)' }}
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: 'var(--color-teal)' }}
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (platform.android && manualGuide) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-[480px] mx-auto animate-slide-up">
        <div className="rounded-xl p-4 shadow-2xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Instalar Taskway en Android</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sigue estos pasos para instalar la app</p>
            </div>
          </div>
          <div className="space-y-2 mb-3" style={{ color: 'var(--color-text)' }}>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}>1</span>
              <span>Abre Chrome en tu dispositivo</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}>2</span>
              <span>Toca el menú <strong>⋮</strong> (tres puntos)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}>3</span>
              <span>Toca <strong>"Instalar app"</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-teal)', color: '#fff' }}>4</span>
              <span>Toca <strong>"Instalar"</strong></span>
            </div>
          </div>
          <button
            onClick={dismissManualGuide}
            className="w-full py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-fondo)' }}
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }

  return null
}
