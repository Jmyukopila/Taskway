import { useRef, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { TEMAS } from '../config/themes'

import {
  TemaDefaultIcon, TemaSepiaIcon, TemaOceanIcon, TemaMinimalIcon,
  EstiloClasicoIcon, EstiloAceroIcon, EstiloFloraIcon,
  SunIcon, MoonIcon, CloseIcon, CheckIcon,
  HoyIcon, CalendarioIcon, HabitosIcon, HorarioIcon, TareasIcon
} from '../config/icons'
import { exportarDatos, importarDatos } from '../lib/dataManager'

const THEME_ICONS = {
  temaDefault: TemaDefaultIcon,
  temaSepia: TemaSepiaIcon,
  temaOcean: TemaOceanIcon,
  temaMinimal: TemaMinimalIcon
}

const FAMILIA_ICONS = {
  clasico: EstiloClasicoIcon,
  flora: EstiloFloraIcon,
  acero: EstiloAceroIcon
}

const PREVIEW_ICONS = [HoyIcon, CalendarioIcon, HabitosIcon, HorarioIcon, TareasIcon]

export default function SettingsView({ onClose, alarmEnabled, setAlarmEnabled }) {
  const { theme, setTema, setFamilia, setVariante, toggleModo, temasDisponibles, familias } = useTheme()
  const fileRef = useRef(null)
  const [importStatus, setImportStatus] = useState(null)

  const familiaActual = familias.find(f => f.key === (theme.familia || 'clasico'))
  const varianteActual = theme.variante

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus(null)
    importarDatos(file).then(() => {
      setImportStatus('ok')
      setTimeout(() => window.location.reload(), 1500)
    }).catch(() => {
      setImportStatus('error')
      setTimeout(() => setImportStatus(null), 3000)
    })
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-[480px] mx-auto rounded-t-2xl animate-slide-up max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--color-card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--color-card)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Configuracion</h2>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--color-muted)' }}>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-6">
          {/* === TEMAS === */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>Temas</h3>
            <div className="grid grid-cols-2 gap-3">
              {temasDisponibles.map(t => {
                const IconComp = THEME_ICONS[t.icon]
                const activo = theme.tema === t.key
                const temaData = TEMAS[t.key]
                const colores = temaData ? [
                  temaData[theme.modo]?.fondo,
                  temaData[theme.modo]?.card,
                  temaData[theme.modo]?.teal,
                  temaData[theme.modo]?.purple
                ] : []
                return (
                  <button
                    key={t.key}
                    onClick={() => setTema(t.key)}
                    className="relative rounded-xl p-4 text-left transition-all active:scale-95 border"
                    style={{
                      backgroundColor: 'var(--color-fondo)',
                      borderColor: activo ? 'var(--color-teal)' : 'var(--color-border)'
                    }}
                  >
                    {activo && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
                        <CheckIcon className="w-3 h-3" style={{ color: '#fff' }} />
                      </div>
                    )}
                    <div className="flex gap-1 mb-3">
                      {colores.map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c, borderColor: 'var(--color-border)' }} />
                      ))}
                    </div>
                    {IconComp && <IconComp className="w-6 h-6 mb-1" style={{ color: 'var(--color-teal)' }} />}
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{t.name}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* === FAMILIA + VARIANTE === */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>Familia de iconos</h3>
            <div className="grid grid-cols-3 gap-3">
              {familias.map(fam => {
                const IconComp = FAMILIA_ICONS[fam.key]
                const activo = theme.familia === fam.key
                return (
                  <button
                    key={fam.key}
                    onClick={() => setFamilia(fam.key)}
                    className="relative rounded-xl p-3 text-center transition-all active:scale-95 border"
                    style={{
                      backgroundColor: 'var(--color-fondo)',
                      borderColor: activo ? 'var(--color-teal)' : 'var(--color-border)'
                    }}
                  >
                    {activo && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
                        <CheckIcon className="w-2.5 h-2.5" style={{ color: '#fff' }} />
                      </div>
                    )}
                    {IconComp && <IconComp className="w-8 h-8 mx-auto mb-1.5" style={{ color: 'var(--color-teal)' }} />}
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{fam.name}</p>
                  </button>
                )
              })}
            </div>

            {/* Variantes (if applicable) */}
            {familiaActual?.variantes && (
              <div className="mt-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Variante</h4>
                <div className="grid grid-cols-3 gap-2">
                  {familiaActual.variantes.map(v => {
                    const activo = varianteActual === v.key
                    return (
                      <button
                        key={v.key}
                        onClick={() => setVariante(v.key)}
                        className="relative rounded-xl p-2.5 text-center transition-all active:scale-95 border text-xs"
                        style={{
                          backgroundColor: 'var(--color-fondo)',
                          borderColor: activo ? 'var(--color-teal)' : 'var(--color-border)',
                          color: 'var(--color-text)'
                        }}
                      >
                        {activo && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
                            <CheckIcon className="w-2 h-2" style={{ color: '#fff' }} />
                          </div>
                        )}
                        {/* Color dots preview */}
                        <div className="flex gap-1 justify-center mb-1.5">
                          {v.colors ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: v.colors.teal || 'var(--color-teal)' }} />
                              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: v.colors.purple || 'var(--color-purple)' }} />
                            </>
                          ) : null}
                        </div>
                        <span className="font-medium">{v.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Preview mini iconos */}
            <div className="flex gap-3 mt-3 justify-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-fondo)' }}>
              {PREVIEW_ICONS.map((IconComp, i) => (
                <IconComp key={i} className="w-5 h-5" style={{ color: 'var(--color-muted)' }} />
              ))}
            </div>
          </section>

          {/* === CONFIGURACION === */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>Configuracion</h3>
            <div className="space-y-2">
              <button
                onClick={toggleModo}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: 'var(--color-fondo)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <div className="flex items-center gap-3">
                  {theme.modo === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                  <span className="text-sm">Modo {theme.modo === 'dark' ? 'oscuro' : 'claro'}</span>
                </div>
                <div
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{ backgroundColor: theme.modo === 'dark' ? 'var(--color-teal)' : 'var(--color-border)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: theme.modo === 'dark' ? '22px' : '2px' }}
                  />
                </div>
              </button>

              <button
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: 'var(--color-fondo)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 17a5 5 0 001-5 5 5 0 00-10 0 5 5 0 001 5" />
                    <path d="M11 21h2" />
                    <path d="M20 11a8 8 0 10-16 0" />
                  </svg>
                  <span className="text-sm">Alarma sonora en notificaciones</span>
                </div>
                <div
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{ backgroundColor: alarmEnabled ? 'var(--color-teal)' : 'var(--color-border)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: alarmEnabled ? '22px' : '2px' }}
                  />
                </div>
              </button>

              <button
                onClick={exportarDatos}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-sm"
                style={{
                  backgroundColor: 'var(--color-fondo)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Exportar datos</span>
              </button>

              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-sm"
                  style={{
                    backgroundColor: importStatus === 'error' ? 'color-mix(in srgb, var(--color-danger) 15%, transparent)' : 'var(--color-fondo)',
                    borderColor: importStatus === 'error' ? 'var(--color-danger)' : 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>{importStatus === 'ok' ? 'Datos importados. Recargando...' : importStatus === 'error' ? 'Error al importar' : 'Importar datos'}</span>
                </button>
                <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
