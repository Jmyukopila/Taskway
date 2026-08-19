import { useState, useEffect, useCallback } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { STORAGE_KEYS } from '../config/constants'
import { CloseIcon, GearIcon, CheckIcon } from '../config/icons'

const DURACIONES_DEFAULT = {
  trabajo: 25 * 60,
  descansoCorto: 5 * 60,
  descansoLargo: 15 * 60
}

const NOMBRE_MODO = {
  trabajo: 'Enfoque',
  descansoCorto: 'Descanso',
  descansoLargo: 'Descanso largo'
}

const CAMPOS_DURACION = [
  { key: 'trabajo', label: 'Enfoque', defaultMin: 25 },
  { key: 'descansoCorto', label: 'Descanso corto', defaultMin: 5 },
  { key: 'descansoLargo', label: 'Descanso largo', defaultMin: 15 }
]

function notificar(modo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const msg = modo === 'trabajo' ? '¡Tiempo de descanso!' : '¡Tiempo de trabajar!'
  new Notification('Taskway — Pomodoro', { body: msg, tag: 'pomodoro' })
}

export default function PomodoroTimer({ onClose, tareasPendientes = [], onToggle }) {
  const [durations, setDurations] = useState(() => loadJSON(STORAGE_KEYS.POMODORO, null) || DURACIONES_DEFAULT)
  const [modo, setModo] = useState('trabajo')
  const [tiempo, setTiempo] = useState(() => durations.trabajo)
  // Instante en el que acaba la fase. Contar sobre un deadline en vez de restar
  // un segundo por tick evita que el temporizador se atrase cuando el navegador
  // ralentiza los intervalos con la pestana en segundo plano.
  const [finAt, setFinAt] = useState(null)
  const [ciclos, setCiclos] = useState(0)
  const [tareaActiva, setTareaActiva] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const corriendo = finAt !== null

  const finalizarFase = useCallback(() => {
    setFinAt(null)
    notificar(modo)
    if (modo === 'trabajo') {
      const nuevoCiclo = ciclos + 1
      const largo = nuevoCiclo % 4 === 0
      setCiclos(nuevoCiclo)
      setModo(largo ? 'descansoLargo' : 'descansoCorto')
      setTiempo(largo ? durations.descansoLargo : durations.descansoCorto)
    } else {
      setModo('trabajo')
      setTiempo(durations.trabajo)
    }
  }, [modo, ciclos, durations])

  useEffect(() => {
    if (finAt === null) return
    let finalizado = false
    const id = setInterval(() => {
      const restante = Math.max(0, Math.round((finAt - Date.now()) / 1000))
      setTiempo(restante)
      if (restante === 0 && !finalizado) {
        finalizado = true
        finalizarFase()
      }
    }, 250)
    return () => clearInterval(id)
  }, [finAt, finalizarFase])

  const alternarMarcha = () => {
    if (corriendo) setFinAt(null)
    else if (tiempo > 0) setFinAt(Date.now() + tiempo * 1000)
    else {
      setTiempo(durations[modo])
      setFinAt(Date.now() + durations[modo] * 1000)
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const resetear = useCallback(() => {
    setFinAt(null)
    setModo('trabajo')
    setTiempo(durations.trabajo)
    setCiclos(0)
    setTareaActiva(null)
  }, [durations])

  const handleDurationChange = (key, minutes) => {
    const segundos = Math.min(180, Math.max(1, minutes)) * 60
    const nuevas = { ...durations, [key]: segundos }
    setDurations(nuevas)
    saveJSON(STORAGE_KEYS.POMODORO, nuevas)
    if (key === modo) {
      setFinAt(null)
      setTiempo(segundos)
    }
  }

  const completarTareaActiva = () => {
    if (!tareaActiva) return
    onToggle?.(tareaActiva)
    setTareaActiva(null)
  }

  const minutos = Math.floor(tiempo / 60)
  const segundos = tiempo % 60
  const total = durations[modo] || 1
  const progreso = Math.min(100, ((total - tiempo) / total) * 100)

  const radio = 70
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (progreso / 100) * circunferencia
  const acento = modo === 'trabajo' ? 'var(--color-teal)' : 'var(--color-purple)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-[320px] rounded-2xl p-6 animate-scale-in border shadow-2xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Temporizador Pomodoro"
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1" style={{ color: 'var(--color-muted)' }} aria-label="Cerrar">
          <CloseIcon className="w-5 h-5" />
        </button>

        <p className="text-xs font-medium text-center mb-4 uppercase tracking-wider" style={{ color: acento }}>
          {NOMBRE_MODO[modo]}
        </p>

        {modo === 'trabajo' && tareasPendientes.length > 0 && !editMode && (
          <div className="mb-4 flex gap-2">
            <select
              value={tareaActiva || ''}
              onChange={e => setTareaActiva(e.target.value || null)}
              className="flex-1 min-w-0 text-xs rounded-lg px-2 py-1.5 border"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              aria-label="Tarea en la que trabajar"
            >
              <option value="">Sin tarea específica</option>
              {tareasPendientes.map(t => (
                <option key={t.id} value={t.id}>{t.titulo}</option>
              ))}
            </select>
            {tareaActiva && (
              <button
                onClick={completarTareaActiva}
                className="flex items-center gap-1 px-2.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }}
                aria-label="Marcar la tarea como completada"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                Hecha
              </button>
            )}
          </div>
        )}

        {editMode ? (
          <>
            <div className="space-y-3 mb-4">
              {CAMPOS_DURACION.map(({ key, label, defaultMin }) => (
                <div key={key} className="flex items-center justify-between">
                  <label htmlFor={`pomodoro-${key}`} className="text-sm" style={{ color: 'var(--color-text)' }}>{label}</label>
                  <div className="flex items-center gap-1">
                    <input
                      id={`pomodoro-${key}`}
                      type="number"
                      min={1}
                      max={180}
                      value={Math.floor(durations[key] / 60)}
                      onChange={e => handleDurationChange(key, parseInt(e.target.value, 10) || defaultMin)}
                      className="w-16 text-center text-sm rounded-lg px-2 py-1.5 border"
                      style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
            <div className="flex justify-center mb-4">
              <div className="relative w-[160px] h-[160px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                  <circle cx="80" cy="80" r={radio} fill="none" strokeWidth="6" style={{ stroke: 'var(--color-border)' }} />
                  <circle cx="80" cy="80" r={radio} fill="none" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={offset}
                    style={{ stroke: acento, transition: 'stroke-dashoffset 0.5s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}
                    role="timer" aria-live="off">
                    {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>
                    Ciclo {ciclos + 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={alternarMarcha}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
                style={{ backgroundColor: acento }}
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
                aria-label="Ajustar tiempos"
              >
                <GearIcon className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
