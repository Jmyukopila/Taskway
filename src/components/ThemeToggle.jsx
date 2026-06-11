import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTema, toggleModo, temasDisponibles, menuOpen, setMenuOpen } = useTheme()

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-xl transition-all active:scale-90"
        style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
        title="Cambiar tema"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-0 top-12 z-50 w-48 rounded-xl border shadow-xl animate-scale-in overflow-hidden"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="p-2 space-y-1">
              {temasDisponibles.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTema(t.key); setMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: theme.tema === t.key ? 'var(--color-teal)' : 'transparent',
                    color: theme.tema === t.key ? '#fff' : 'var(--color-text)'
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                  {theme.tema === t.key && (
                    <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => { toggleModo(); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--color-text)' }}
              >
                {theme.modo === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span>{theme.modo === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
