import { useState, useRef, useEffect, useCallback } from 'react'

const DURACIONES = {
  trabajo: 25 * 60,
  descansoCorto: 5 * 60,
  descansoLargo: 15 * 60
}

export default function PomodoroTimer({ onClose, tareasPendientes = [] }) {
  const [modo, setModo] = useState('trabajo')
  const [tiempo, setTiempo] = useState(DURACIONES.trabajo)
  const [corriendo, setCorriendo] = useState(false)
  const [ciclos, setCiclos] = useState(0)
  const [tareaActiva, setTareaActiva] = useState(null)
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
            new Notification('Mi Día — Pomodoro', { body: msg })
            setTimeout(() => { notifRef.current = false }, 1000)
          }

          if (modo === 'trabajo') {
            setCiclos(c => {
              const nuevo = c + 1
              if (nuevo % 4 === 0) {
                setModo('descansoLargo')
                setTiempo(DURACIONES.descansoLargo)
              } else {
                setModo('descansoCorto')
                setTiempo(DURACIONES.descansoCorto)
              }
              return nuevo
            })
          } else {
            setModo('trabajo')
            setTiempo(DURACIONES.trabajo)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setCorriendo(true)
  }, [modo, detener])

  const resetear = useCallback(() => {
    detener()
    setModo('trabajo')
    setTiempo(DURACIONES.trabajo)
    setCiclos(0)
    setTareaActiva(null)
  }, [detener])

  const minutos = Math.floor(tiempo / 60)
  const segundos = tiempo % 60
  const total = DURACIONES[modo]
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
        {modo === 'trabajo' && tareasPendientes.length > 0 && (
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
        </div>
      </div>
    </div>
  )
}
