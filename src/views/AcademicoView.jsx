import { useState } from 'react'
import DashboardView from './DashboardView'
import AcademicoTareas from '../components/AcademicoTareas'
import NotasView from '../components/NotasView'

const SUBVISTAS = [
  { key: 'tareas', label: 'Tareas' },
  { key: 'notas', label: 'Notas' },
  { key: 'resumen', label: 'Resumen' }
]

export default function AcademicoView({
  tasks, habits, classes, notas,
  onAddClass, onAddTask, onToggle, onDeleteTask, toggleSubtask, onUpdateTask
}) {
  const [sub, setSub] = useState('tareas')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Académico</h1>
        <div className="flex gap-1.5" role="tablist" aria-label="Secciones académicas">
          {SUBVISTAS.map(s => {
            const activo = sub === s.key
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={activo}
                onClick={() => setSub(s.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: activo ? 'color-mix(in srgb, var(--color-teal) 20%, transparent)' : 'var(--color-card)',
                  color: activo ? 'var(--color-teal)' : 'var(--color-muted)',
                  border: `1px solid ${activo ? 'color-mix(in srgb, var(--color-teal) 30%, transparent)' : 'var(--color-border)'}`
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {sub === 'tareas' && (
          <AcademicoTareas
            tasks={tasks}
            classes={classes}
            onAddClass={onAddClass}
            onAddTask={onAddTask}
            onToggle={onToggle}
            onDeleteTask={onDeleteTask}
            toggleSubtask={toggleSubtask}
            onUpdateTask={onUpdateTask}
          />
        )}
        {sub === 'notas' && <NotasView tasks={tasks} classes={classes} notas={notas} onAddClass={onAddClass} />}
        {sub === 'resumen' && <DashboardView tasks={tasks} habits={habits} />}
      </div>
    </div>
  )
}
