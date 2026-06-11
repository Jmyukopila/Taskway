import { useMemo } from 'react'
import DayTimeline from '../components/DayTimeline'
import { hoy, diaSemana, formatFecha } from '../lib/dates'

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function TodayView({ tasks, classes, onToggle, onDeleteTask, toggleSubtask }) {
  const hoyStr = hoy()
  const dayName = diaSemana(hoyStr)

  const tareasHoy = useMemo(() => tasks.filter(t => t.fecha === hoyStr), [tasks, hoyStr])
  const clasesHoy = useMemo(() => classes.filter(c => c.diasSemana.includes(dayName)), [classes, dayName])

  const completadasCount = useMemo(() => tareasHoy.filter(t => t.completada).length, [tareasHoy])
  const totalCount = tareasHoy.length
  const progreso = totalCount > 0 ? Math.round((completadasCount / totalCount) * 100) : 0

  const tareasCompletadasHoy = useMemo(() => tareasHoy.filter(t => t.completada), [tareasHoy])
  const tareasPendientesHoy = useMemo(() => tareasHoy.filter(t => !t.completada), [tareasHoy])

  return (
    <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
      <div className="mb-6 animate-fade-in-up">
        <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{getSaludo()}</p>
        <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>{formatFecha(hoyStr)}</h1>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--color-text-secondary)' }}>{dayName}</p>
      </div>

      {totalCount > 0 && (
        <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {completadasCount} de {totalCount} completadas
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-teal)' }}>{progreso}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
              width: `${progreso}%`,
              backgroundColor: 'var(--color-teal)'
            }} />
          </div>
        </div>
      )}

      <DayTimeline
        tareas={tareasPendientesHoy}
        clases={clasesHoy}
        onToggle={onToggle}
        onDeleteTask={onDeleteTask}
        toggleSubtask={toggleSubtask}
      />

      {/* Completadas hoy */}
      {tareasCompletadasHoy.length > 0 && (
        <details className="mt-6 group">
          <summary className="text-xs font-medium cursor-pointer list-none flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-muted)' }}>
            <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Completadas ({tareasCompletadasHoy.length})
          </summary>
          <div className="mt-3 space-y-2">
            {tareasCompletadasHoy.map(t => (
              <div key={t.id} className="rounded-xl border p-3 flex items-center gap-3"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 50%, transparent)', borderColor: 'var(--color-border)', opacity: 0.6 }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-teal) 30%, transparent)' }}>
                  <svg className="w-3 h-3" style={{ color: 'var(--color-teal)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm line-through" style={{ color: 'var(--color-text)' }}>{t.titulo}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
