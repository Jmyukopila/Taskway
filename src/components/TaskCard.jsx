import { useState } from 'react'
import Checkbox from './ui/Checkbox'
import Badge from './ui/Badge'
import { RecurringIcon } from '../config/icons'
import { hoy } from '../lib/dates'

const PRIORIDAD_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' }

function prioridadBorder(p) {
  return p === 'alta' ? 'var(--color-purple)' : p === 'media' ? 'var(--color-teal)' : '#4a5568'
}

export default function TaskCard({ tarea, onToggle, onDelete, toggleSubtask }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [subtasksOpen, setSubtasksOpen] = useState(false)

  const subtareas = tarea.subtasks || []
  const subtareasCompletadas = subtareas.filter(s => s.completada).length
  const progreso = subtareas.length > 0 ? Math.round((subtareasCompletadas / subtareas.length) * 100) : 0
  const esRecurrente = !!tarea.recurrencia
  const esVencida = !tarea.completada && tarea.fecha && tarea.fecha < hoy()

  const handleDelete = () => {
    if (confirmDelete) { onDelete(tarea.id); setConfirmDelete(false) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2 border transition-all duration-200 group"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        borderLeftWidth: '3px',
        borderLeftColor: prioridadBorder(tarea.prioridad),
        opacity: tarea.completada ? 0.6 : 1
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={tarea.completada} onChange={() => onToggle(tarea.id)} className="mt-0.5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3
                className={`text-sm font-medium leading-snug ${tarea.completada ? 'line-through' : ''}`}
                style={{ color: 'var(--color-text)' }}
              >
                {tarea.titulo}
              </h3>
              {esRecurrente && (
                <RecurringIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
              )}
              {esVencida && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-danger) 15%, transparent)', color: 'var(--color-danger)' }}>
                  Vencida
                </span>
              )}
            </div>
            <Badge variant={tarea.prioridad}>{PRIORIDAD_LABELS[tarea.prioridad]}</Badge>
          </div>

          {tarea.descripcion && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{tarea.descripcion}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {tarea.hora && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{tarea.hora}</span>
              </div>
            )}
            {tarea.fecha && (
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{tarea.fecha}</span>
            )}
          </div>

          {/* Subtareas progress */}
          {subtareas.length > 0 && (
            <button
              onClick={() => setSubtasksOpen(!subtasksOpen)}
              className="flex items-center gap-2 mt-2 w-full"
            >
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{
                  width: `${progreso}%`,
                  backgroundColor: progreso === 100 ? 'var(--color-teal)' : progreso > 50 ? 'var(--color-purple)' : 'var(--color-muted)'
                }} />
              </div>
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                {subtareasCompletadas}/{subtareas.length}
              </span>
            </button>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            color: confirmDelete ? 'var(--color-danger)' : 'var(--color-muted)',
            backgroundColor: confirmDelete ? 'color-mix(in srgb, var(--color-danger) 20%, transparent)' : 'transparent'
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {confirmDelete ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Subtasks list */}
      {subtareas.length > 0 && subtasksOpen && (
        <div className="ml-8 space-y-1 animate-fade-in">
          {subtareas.map(s => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <button
                onClick={() => toggleSubtask?.(tarea.id, s.id)}
                className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: s.completada ? 'var(--color-teal)' : 'transparent',
                  borderColor: s.completada ? 'var(--color-teal)' : 'var(--color-muted)'
                }}
              >
                {s.completada && (
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`text-xs ${s.completada ? 'line-through' : ''}`}
                style={{ color: s.completada ? 'var(--color-muted)' : 'var(--color-text)' }}
              >
                {s.titulo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
