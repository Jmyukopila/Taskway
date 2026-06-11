import { useState, useRef } from 'react'
import WeeklyGrid from '../components/WeeklyGrid'
import AddClassModal from '../components/AddClassModal'

export default function ScheduleView({ classes, onAddClass, onDeleteClass, onUpdateClass }) {
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [menuClassId, setMenuClassId] = useState(null)
  const lastTap = useRef({ id: null, time: 0 })

  return (
    <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Horario</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Lunes - Sabado</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-teal)',
            boxShadow: '0 4px 6px -1px color-mix(in srgb, var(--color-teal) 20%, transparent)'
          }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <WeeklyGrid
        clases={classes}
        onDeleteClass={onDeleteClass}
        onAddClick={() => setShowModal(true)}
      />

      <div className="mt-6 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-muted)' }}>Todas las clases</h3>
        {classes.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-muted)' }}>Sin clases registradas</p>
        ) : (
          classes.map((clase, idx) => (
            <div key={clase.id} className="flex items-center gap-3 p-3 rounded-xl border group transition-colors animate-fade-in-up"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', animationDelay: `${idx * 50}ms` }}
              onClick={() => {
                const now = Date.now()
                if (lastTap.current.id === clase.id && now - lastTap.current.time < 300) {
                  setMenuClassId(menuClassId === clase.id ? null : clase.id)
                  lastTap.current = { id: null, time: 0 }
                } else {
                  lastTap.current = { id: clase.id, time: now }
                }
              }}>
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: clase.color }} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{clase.materia}</h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {clase.horaInicio} - {clase.horaFin}{clase.salon && ` · ${clase.salon}`}{clase.profesor && ` · ${clase.profesor}`}
                </p>
                <p className="text-[11px] mt-0.5 capitalize" style={{ color: 'var(--color-muted)' }}>
                  {clase.diasSemana.join(', ')}
                </p>
              </div>

              {menuClassId === clase.id && (
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuClassId(null)} />
                  <div className="relative z-50 flex gap-2 p-1.5 rounded-lg border"
                    style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => { setEditingClass(clase); setMenuClassId(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                      style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 10%, transparent)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => { onDeleteClass(clase.id); setMenuClassId(null) }}
                      className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                      style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && <AddClassModal onClose={() => setShowModal(false)} onAdd={onAddClass} />}
      {editingClass && (
        <AddClassModal
          clase={editingClass}
          onClose={() => setEditingClass(null)}
          onAdd={(data) => { onUpdateClass?.(editingClass.id, data); setEditingClass(null) }}
        />
      )}
    </div>
  )
}
