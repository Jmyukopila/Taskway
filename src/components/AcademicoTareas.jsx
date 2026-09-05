import { useMemo, useState } from 'react'
import TaskCard from './TaskCard'
import AddTaskModal from './AddTaskModal'
import AddClassModal from './AddClassModal'
import { getMateriaTarea } from '../lib/academico'
import { materiasDelHorario } from '../lib/materias'
import { ChevronRightIcon, EmptyIcon, PlusIcon } from '../config/icons'

const redondear = (n) => Math.round(n * 100) / 100
const fmtNota = (n) => n == null ? null : n.toLocaleString('es', { maximumFractionDigits: 2 })

export default function AcademicoTareas({ tasks, classes, onAddClass, onAddTask, onToggle, onDeleteTask, toggleSubtask, onUpdateTask }) {
  const [modalTarea, setModalTarea] = useState(null) // { materiaInicial } | { task }
  const [nuevaMateria, setNuevaMateria] = useState(false)
  const [colapsado, setColapsado] = useState({})

  const grupos = useMemo(() => {
    const map = new Map()
    // Todas las materias del horario, aunque no tengan tareas todavia.
    for (const m of materiasDelHorario(classes)) {
      map.set(m.nombre, { materia: m.nombre, enHorario: true, tareas: [] })
    }
    // Cada tarea a su materia; si su materia ya no esta en el horario, grupo aparte.
    for (const t of tasks) {
      const materia = getMateriaTarea(t, classes)
      if (!materia) continue
      if (!map.has(materia)) map.set(materia, { materia, enHorario: false, tareas: [] })
      map.get(materia).tareas.push(t)
    }
    return [...map.values()]
      .map(g => {
        const calificadas = g.tareas.filter(t => t.calificacion != null)
        return {
          ...g,
          tareas: [...g.tareas].sort((a, b) =>
            Number(a.completada) - Number(b.completada) ||
            (b.fecha || '').localeCompare(a.fecha || '')
          ),
          pendientes: g.tareas.filter(t => !t.completada).length,
          promedio: calificadas.length
            ? redondear(calificadas.reduce((s, t) => s + t.calificacion, 0) / calificadas.length)
            : null
        }
      })
      .sort((a, b) => Number(b.enHorario) - Number(a.enHorario) || a.materia.localeCompare(b.materia))
  }, [tasks, classes])

  const sinMaterias = grupos.length === 0

  return (
    <div className="flex-1 px-4 pb-24 overflow-y-auto">
      {sinMaterias ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <EmptyIcon className="w-16 h-16 mb-3" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <p className="text-sm text-center max-w-[240px] mb-4" style={{ color: 'var(--color-muted)' }}>
            Agrega tus materias en el Horario y aquí verás sus tareas.
          </p>
          <button
            onClick={() => setNuevaMateria(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: 'var(--color-teal)' }}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Añadir materia al horario
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {grupos.map((g, idx) => {
            const abierto = colapsado[g.materia] !== true
            return (
              <div key={g.materia} className="animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setColapsado(prev => ({ ...prev, [g.materia]: abierto }))}
                    aria-expanded={abierto}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <ChevronRightIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${abierto ? 'rotate-90' : ''}`} style={{ color: 'var(--color-muted)' }} />
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{g.materia}</span>
                    <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                      {g.tareas.length === 0
                        ? 'sin tareas'
                        : `${g.pendientes} pend.${g.promedio != null ? ` · prom. ${fmtNota(g.promedio)}` : ''}`}
                      {!g.enHorario && ' · fuera del horario'}
                    </span>
                  </button>
                  <button
                    onClick={() => setModalTarea({ materiaInicial: g.materia })}
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ color: 'var(--color-teal)' }}
                    aria-label={`Nueva tarea de ${g.materia}`}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                {abierto && g.tareas.length > 0 && (
                  <div className="space-y-2">
                    {g.tareas.map(t => (
                      <TaskCard
                        key={t.id}
                        tarea={t}
                        classes={classes}
                        onToggle={onToggle}
                        onDelete={onDeleteTask}
                        toggleSubtask={toggleSubtask}
                        onEdit={(task) => setModalTarea({ task })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <button
            onClick={() => setNuevaMateria(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl border border-dashed"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Añadir materia al horario
          </button>
        </div>
      )}

      <button
        onClick={() => setModalTarea({})}
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

      {modalTarea && (
        <AddTaskModal
          task={modalTarea.task}
          materiaInicial={modalTarea.materiaInicial || ''}
          classes={classes}
          onClose={() => setModalTarea(null)}
          onAdd={(data) => {
            if (modalTarea.task) onUpdateTask?.(modalTarea.task.id, data)
            else onAddTask(data)
            setModalTarea(null)
          }}
        />
      )}
      {nuevaMateria && (
        <AddClassModal onClose={() => setNuevaMateria(false)} onAdd={onAddClass} />
      )}
    </div>
  )
}
