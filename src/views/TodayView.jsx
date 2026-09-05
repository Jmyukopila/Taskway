import { useMemo, useState } from 'react'
import DayTimeline from '../components/DayTimeline'
import TaskCard from '../components/TaskCard'
import AddTaskModal from '../components/AddTaskModal'
import { hoy, diaSemana, formatFecha } from '../lib/dates'
import { ChevronRightIcon } from '../config/icons'

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function TodayView({ tasks, classes, onToggle, onDeleteTask, toggleSubtask, onUpdateTask }) {
  const hoyStr = hoy()
  const dayName = diaSemana(hoyStr)
  const [editingTask, setEditingTask] = useState(null)

  const tareasHoy = useMemo(() => tasks.filter(t => t.fecha === hoyStr), [tasks, hoyStr])
  const clasesHoy = useMemo(() => classes.filter(c => c.diasSemana.includes(dayName)), [classes, dayName])

  const completadasCount = useMemo(() => tareasHoy.filter(t => t.completada).length, [tareasHoy])
  const totalCount = tareasHoy.length
  const progreso = totalCount > 0 ? Math.round((completadasCount / totalCount) * 100) : 0

  const tareasCompletadasHoy = useMemo(() => tareasHoy.filter(t => t.completada), [tareasHoy])
  const tareasPendientesHoy = useMemo(() => tareasHoy.filter(t => !t.completada), [tareasHoy])

  return (
    <div className="flex-1 px-4 pt-4 pb-8 overflow-y-auto">
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
        classes={classes}
        onToggle={onToggle}
        onDeleteTask={onDeleteTask}
        toggleSubtask={toggleSubtask}
        onEditTask={setEditingTask}
      />

      {/* Completadas hoy */}
      {tareasCompletadasHoy.length > 0 && (
        <details className="mt-6 group">
          <summary className="text-xs font-medium cursor-pointer list-none flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-muted)' }}>
            <ChevronRightIcon className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
            Completadas ({tareasCompletadasHoy.length})
          </summary>
          <div className="mt-3 space-y-2">
            {tareasCompletadasHoy.map(t => (
              <TaskCard key={t.id} tarea={t} classes={classes} onToggle={onToggle} onDelete={onDeleteTask} toggleSubtask={toggleSubtask} onEdit={setEditingTask} />
            ))}
          </div>
        </details>
      )}

      {editingTask && (
        <AddTaskModal
          task={editingTask}
          classes={classes}
          onClose={() => setEditingTask(null)}
          onAdd={(data) => { onUpdateTask?.(editingTask.id, data); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
