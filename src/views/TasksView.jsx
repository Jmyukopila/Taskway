import { useState, useMemo } from 'react'
import TaskCard from '../components/TaskCard'
import AddTaskModal from '../components/AddTaskModal'
import { formatFecha } from '../lib/dates'

const FILTROS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' }
]

export default function TasksView({ tasks, onAddTask, onToggle, onDeleteTask, toggleSubtask, onUpdateTask }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filtro, setFiltro] = useState('all')
  const [busqueda, setBusqueda] = useState('')
  const [fechaExp, setFechaExp] = useState({})

  const tareasFiltradas = useMemo(() => {
    let t = filtro === 'all' ? tasks : tasks.filter(ta => filtro === 'pending' ? !ta.completada : ta.completada)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      t = t.filter(ta => ta.titulo.toLowerCase().includes(q) || ta.descripcion.toLowerCase().includes(q))
    }
    return t.sort((a, b) => b.fecha.localeCompare(a.fecha) || (a.hora || '').localeCompare(b.hora || ''))
  }, [tasks, filtro, busqueda])

  const tareasAgrupadas = useMemo(() => {
    const grupos = {}
    tareasFiltradas.forEach(t => {
      if (!grupos[t.fecha]) grupos[t.fecha] = []
      grupos[t.fecha].push(t)
    })
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a))
  }, [tareasFiltradas])

  const toggleFecha = (fecha) => {
    setFechaExp(prev => ({ ...prev, [fecha]: !prev[fecha] }))
  }

  return (
    <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
      <div className="mb-4 animate-fade-in-up">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Tareas</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{tasks.length} tareas en total</p>
      </div>

      {/* Búsqueda */}
      <div className="mb-3 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm border transition-all"
            style={{
              backgroundColor: 'var(--color-fondo)',
              borderColor: busqueda ? 'var(--color-teal)' : 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-muted)' }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-5 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: filtro === f.key ? 'color-mix(in srgb, var(--color-teal) 20%, transparent)' : 'var(--color-card)',
              color: filtro === f.key ? 'var(--color-teal)' : 'var(--color-muted)',
              border: `1px solid ${filtro === f.key ? 'color-mix(in srgb, var(--color-teal) 30%, transparent)' : 'var(--color-border)'}`
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {tareasAgrupadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 empty-state animate-fade-in-up">
          <svg className="w-20 h-20 mb-3" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>
            {busqueda ? 'Sin resultados para tu búsqueda' : filtro === 'all' ? 'No hay tareas aún' : 'No hay tareas en este filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tareasAgrupadas.map(([fecha, tareas], idx) => {
            const isExpanded = fechaExp[fecha] !== false
            return (
              <div key={fecha} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                <button onClick={() => toggleFecha(fecha)} className="flex items-center gap-2 w-full mb-2">
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    style={{ color: 'var(--color-muted)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    {formatFecha(fecha)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--color-muted)', backgroundColor: 'var(--color-card)' }}>
                    {tareas.length}
                  </span>
                </button>
                {isExpanded && (
                  <div className="space-y-2">
                    {tareas.map(t => (
                      <TaskCard key={t.id} tarea={t} onToggle={onToggle} onDelete={onDeleteTask} toggleSubtask={toggleSubtask} onEdit={setEditingTask} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="fixed w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl z-30"
        style={{
          backgroundColor: 'var(--color-purple)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 85px)',
          right: '16px',
          boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--color-purple) 30%, transparent)'
        }}>
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onAdd={onAddTask} />}
      {editingTask && (
        <AddTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onAdd={(data) => { onUpdateTask?.(editingTask.id, data); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
