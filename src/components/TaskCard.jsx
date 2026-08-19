import { useState } from 'react'
import Checkbox from './ui/Checkbox'
import Badge from './ui/Badge'
import { RecurringIcon, ClockIcon, EditIcon, TrashIcon, MoreIcon, CheckIcon } from '../config/icons'
import { hoy } from '../lib/dates'

const PRIORIDAD_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' }

function prioridadBorder(p) {
  return p === 'alta' ? 'var(--color-purple)' : p === 'media' ? 'var(--color-teal)' : 'var(--color-muted)'
}

export default function TaskCard({ tarea, onToggle, onDelete, toggleSubtask, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)
  const [subtasksOpen, setSubtasksOpen] = useState(false)

  const subtareas = tarea.subtasks || []
  const subtareasCompletadas = subtareas.filter(s => s.completada).length
  const progreso = subtareas.length > 0 ? Math.round((subtareasCompletadas / subtareas.length) * 100) : 0
  const esRecurrente = !!tarea.recurrencia
  const esVencida = !tarea.completada && tarea.fecha && tarea.fecha < hoy()

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2 border transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        borderLeftWidth: '3px',
        borderLeftColor: prioridadBorder(tarea.prioridad),
        opacity: tarea.completada ? 0.6 : 1
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={tarea.completada} onChange={() => onToggle(tarea.id)} className="mt-0.5" label={tarea.titulo} />

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
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant={tarea.prioridad}>{PRIORIDAD_LABELS[tarea.prioridad]}</Badge>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 -mr-1 rounded-md transition-colors"
                style={{ color: 'var(--color-muted)' }}
                aria-label={`Acciones de ${tarea.titulo}`}
                aria-expanded={showMenu}
              >
                <MoreIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {tarea.descripcion && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{tarea.descripcion}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {tarea.hora && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" style={{ color: 'var(--color-muted)' }} />
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
              aria-expanded={subtasksOpen}
              aria-label={`Subtareas: ${subtareasCompletadas} de ${subtareas.length}`}
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

          {/* Menu contextual */}
          {showMenu && (
            <div className="mt-2">
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="relative z-50 flex gap-2 p-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => { onEdit?.(tarea); setShowMenu(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 10%, transparent)' }}
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => { onDelete(tarea.id); setShowMenu(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks list */}
      {subtareas.length > 0 && subtasksOpen && (
        <div className="ml-8 space-y-1 animate-fade-in">
          {subtareas.map(s => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <button
                onClick={() => toggleSubtask?.(tarea.id, s.id)}
                aria-pressed={!!s.completada}
                aria-label={s.titulo}
                className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: s.completada ? 'var(--color-teal)' : 'transparent',
                  borderColor: s.completada ? 'var(--color-teal)' : 'var(--color-muted)'
                }}
              >
                {s.completada && <CheckIcon className="w-2.5 h-2.5" style={{ color: '#fff' }} />}
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
