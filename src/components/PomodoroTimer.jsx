import { useState, useRef, useEffect, useCallback } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { STORAGE_KEYS } from '../config/constants'

const DURACIONES_DEFAULT = {
  trabajo: 25 * 60,
  descansoCorto: 5 * 60,
  descansoLargo: 15 * 60
}

export default function PomodoroTimer({ onClose, tareasPendientes = [] }) {
  const [durations, setDurations] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.POMODORO, null)
    return saved || DURACIONES_DEFAULT
  })
  const [modo, setModo] = useState('trabajo')
  const [tiempo, setTiempo] = useState(() => durations.trabajo)
  const [corriendo, setCorriendo] = useState(false)
  const [ciclos, setCiclos] = useState(0)
  const [tareaActiva, setTareaActiva] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const intervalRef = useRef(null)
  const notifRef = useRef(false)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const detener = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setCorriendo(false)
  }, [])

  const iniciar = useCallback(() => {
    detener()
    intervalRef.current = setInterval(() => {
      setTiempo(prev => {
        if (prev <= 1) {
          detener()

          if (Notification.permission === 'granted' && !notifRef.current) {
            notifRef.current = true
            const msg = modo === 'trabajo' ? '¡Tiempo de descanso!' : '¡Tiempo de trabajar!'
            new Notification('Taskway — Pomodoro', { body: msg })
            setTimeout(() => { notifRef.current = false }, 1000)
          }

          if (modo === 'trabajo') {
            setCiclos(c => {
              const nuevo = c + 1
              if (nuevo % 4 === 0) {
                setModo('descansoLargo')
                setTiempo(durations.descansoLargo)
              } else {
                setModo('descansoCorto')
                setTiempo(durations.descansoCorto)
              }
              return nuevo
            })
          } else {
            setModo('trabajo')
            setTiempo(durations.trabajo)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setCorriendo(true)
  }, [modo, detener, durations])

  const resetear = useCallback(() => {
    detener()
    setModo('trabajo')
    setTiempo(durations.trabajo)
    setCiclos(0)
    setTareaActiva(null)
  }, [detener, durations])

  const handleDurationChange = (key, minutes) => {
    const segundos = Math.max(60, minutes * 60)
    const nuevas = { ...durations, [key]: segundos }
    setDurations(nuevas)
    saveJSON(STORAGE_KEYS.POMODORO, nuevas)
    if (key === modo) {
      setTiempo(segundos)
      detener()
    }
  }

  const minutos = Math.floor(tiempo / 60)
  const segundos = tiempo % 60
  const total = durations[modo]
  const progreso = total > 0 ? ((total - tiempo) / total) * 100 : 0

  const radio = 70
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (progreso / 100) * circunferencia

  const nombreModo = {
    trabajo: 'Enfoque',
    descansoCorto: 'Descanso',
    descansoLargo: 'Descanso largo'
  }[modo]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-[320px] rounded-2xl p-6 animate-scale-in border shadow-2xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1" style={{ color: 'var(--color-muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modo */}
        <p className="text-xs font-medium text-center mb-4 uppercase tracking-wider" style={{ color: 'var(--color-teal)' }}>
          {nombreModo}
        </p>

        {/* Tarea activa selector */}
        {modo === 'trabajo' && tareasPendientes.length > 0 && !editMode && (
          <div className="mb-4">
            <select
              value={tareaActiva || ''}
              onChange={e => setTareaActiva(e.target.value || null)}
              className="w-full text-xs rounded-lg px-2 py-1.5 border"
              style={{
                backgroundColor: 'var(--color-fondo)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value="">Sin tarea específica</option>
              {tareasPendientes.map(t => (
                <option key={t.id} value={t.id}>{t.titulo}</option>
              ))}
            </select>
          </div>
        )}

        {editMode ? (
          <>
            {/* Edit mode: 3 inputs */}
            <div className="space-y-3 mb-4">
              {[
                { key: 'trabajo', label: 'Enfoque', defaultMin: 25 },
                { key: 'descansoCorto', label: 'Descanso corto', defaultMin: 5 },
                { key: 'descansoLargo', label: 'Descanso largo', defaultMin: 15 }
              ].map(({ key, label, defaultMin }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm" style={{ color: 'var(--color-text)' }}>{label}</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={Math.floor(durations[key] / 60)}
                      onChange={e => handleDurationChange(key, parseInt(e.target.value) || defaultMin)}
                      className="w-16 text-center text-sm rounded-lg px-2 py-1.5 border"
                      style={{
                        backgroundColor: 'var(--color-fondo)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>min</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEditMode(false)}
              className="w-full py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-teal)' }}
            >
              Hecho
            </button>
          </>
        ) : (
          <>
            {/* Timer circular SVG */}
            <div className="flex justify-center mb-4">
              <div className="relative w-[160px] h-[160px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r={radio} fill="none" strokeWidth="6"
                    style={{ stroke: 'var(--color-border)' }} />
                  <circle cx="80" cy="80" r={radio} fill="none" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={offset}
                    style={{
                      stroke: modo === 'trabajo' ? 'var(--color-teal)' : 'var(--color-purple)',
                      transition: 'stroke-dashoffset 0.5s ease'
                    }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums"
                    style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>
                    Ciclo {ciclos + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-3">
              <button
                onClick={corriendo ? detener : iniciar}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
                style={{ backgroundColor: modo === 'trabajo' ? 'var(--color-teal)' : 'var(--color-purple)' }}
              >
                {corriendo ? 'Pausa' : tiempo === 0 ? 'Reiniciar ciclo' : 'Iniciar'}
              </button>
              <button
                onClick={resetear}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--color-muted)', backgroundColor: 'var(--color-fondo)' }}
              >
                Reset
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ color: 'var(--color-muted)', backgroundColor: 'var(--color-fondo)' }}
                title="Ajustar tiempos"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
