import { useMemo, useState } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'
import { getMateriaTarea } from '../lib/academico'
import { ChevronRightIcon, EmptyIcon, PlusIcon } from '../config/icons'

const redondear = (n) => Math.round(n * 100) / 100

export default function AcademicoTareas({ tasks, classes, onAddTask, onToggle, onDeleteTask, toggleSubtask, onUpdateTask }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [colapsado, setColapsado] = useState({})

  const grupos = useMemo(() => {
    const map = new Map()
    for (const t of tasks) {
      const materia = getMateriaTarea(t, classes)
      if (!materia) continue
      if (!map.has(materia)) map.set(materia, [])
      map.get(materia).push(t)
    }
    return [...map.entries()]
      .map(([materia, lista]) => {
        const calificadas = lista.filter(t => t.calificacion != null)
        return {
          materia,
          tareas: [...lista].sort((a, b) =>
            Number(a.completada) - Number(b.completada) ||
            (b.fecha || '').localeCompare(a.fecha || '')
          ),
          pendientes: lista.filter(t => !t.completada).length,
          calificadas: calificadas.length,
          promedio: calificadas.length
            ? redondear(calificadas.reduce((s, t) => s + t.calificacion, 0) / calificadas.length)
            : null
        }
      })
      .sort((a, b) => a.materia.localeCompare(b.materia))
  }, [tasks, classes])

  return (
    <div className="flex-1 px-4 pb-24 overflow-y-auto">
      {grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <EmptyIcon className="w-16 h-16 mb-3" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <p className="text-sm text-center max-w-[240px]" style={{ color: 'var(--color-muted)' }}>
            Aún no tienes tareas con materia. Al crear una tarea, elige su materia para verla aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {grupos.map((g, idx) => {
            const abierto = colapsado[g.materia] !== true
            return (
              <div key={g.materia} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <button
                  onClick={() => setColapsado(prev => ({ ...prev, [g.materia]: abierto }))}
                  aria-expanded={abierto}
                  className="flex items-center gap-2 w-full mb-2 text-left"
                >
                  <ChevronRightIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${abierto ? 'rotate-90' : ''}`} style={{ color: 'var(--color-muted)' }} />
                  <span className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: 'var(--color-text)' }}>{g.materia}</span>
                  <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                    {g.pendientes} pend.{g.promedio != null && ` · prom. ${g.promedio.toLocaleString('es', { maximumFractionDigits: 2 })}`}
                  </span>
                </button>
                {abierto && (
                  <div className="space-y-2">
                    {g.tareas.map(t => (
                      <TaskCard
                        key={t.id}
                        tarea={t}
                        classes={classes}
                        onToggle={onToggle}
                        onDelete={onDeleteTask}
                        toggleSubtask={toggleSubtask}
                        onEdit={setEditingTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="fixed w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl z-30"
        style={{
          backgroundColor: 'var(--color-purple)',
          color: '#fff',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right: '16px',
          boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--color-purple) 30%, transparent)'
        }}
        aria-label="Nueva tarea de materia"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {showModal && <AddTaskModal classes={classes} onClose={() => setShowModal(false)} onAdd={onAddTask} />}
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
