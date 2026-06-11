import { useState, useMemo } from 'react'
import TaskCard from './TaskCard'
import { ahora } from '../lib/dates'

export default function DayTimeline({ tareas, clases, onToggle, onDeleteTask, toggleSubtask }) {
  const tareasConHora = useMemo(() =>
    tareas.filter(t => t.hora && !t.completada).sort((a, b) => a.hora.localeCompare(b.hora)),
    [tareas]
  )

  const tareasSinHora = useMemo(() =>
    tareas.filter(t => !t.hora && !t.completada),
    [tareas]
  )

  const [expanded, setExpanded] = useState(false)
  const horaActualStr = ahora()

  if (tareas.length === 0 && clases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 empty-state animate-fade-in-up">
        <svg className="w-24 h-24 mb-4" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Sin nada pendiente por hoy</p>
        <p className="text-xs mt-1 text-center" style={{ color: 'var(--color-text-secondary)' }}>Agrega tareas y clases para ver tu día organizado</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Clases del día */}
      {clases.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-muted)' }}>Clases</h3>
          {clases.map(clase => (
            <div key={clase.id} className="flex items-center gap-3 p-3 rounded-xl border animate-fade-in-up"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: clase.color }} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{clase.materia}</h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {clase.horaInicio} - {clase.horaFin}{clase.salon && ` · Salón ${clase.salon}`}
                </p>
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>{clase.horaInicio}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {tareasConHora.length > 0 && (
        <div className="relative">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--color-muted)' }}>Horario</h3>
          <div className="absolute left-[18px] top-6 bottom-0 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
          {tareasConHora.map((tarea, idx) => {
            const pasada = tarea.hora < horaActualStr
            return (
              <div key={tarea.id} className="relative pl-10 pb-4 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className={`absolute left-[13px] top-1.5 w-3 h-3 rounded-full border-2 z-10`}
                  style={{
                    backgroundColor: 'var(--color-fondo)',
                    borderColor: pasada ? 'var(--color-muted)' : 'var(--color-teal)'
                  }}>
                  {tarea.completada && (
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-teal)' }}>
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-mono mb-1 block" style={{ color: pasada ? 'var(--color-muted)' : 'var(--color-teal)' }}>
                  {tarea.hora}
                </span>
                <TaskCard tarea={tarea} onToggle={onToggle} onDelete={onDeleteTask} toggleSubtask={toggleSubtask} />
              </div>
            )
          })}
        </div>
      )}

      {/* Sin hora */}
      {tareasSinHora.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full px-1 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Sin hora ({tareasSinHora.length})
            </h3>
            <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--color-muted)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded && (
            <div className="space-y-2">
              {tareasSinHora.map((tarea, idx) => (
                <div key={tarea.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <TaskCard tarea={tarea} onToggle={onToggle} onDelete={onDeleteTask} toggleSubtask={toggleSubtask} />
                </div>
              ))}
            </div>
          )}
          {!expanded && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Toca para ver</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
