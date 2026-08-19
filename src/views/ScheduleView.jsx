import { useState } from 'react'
import WeeklyGrid from '../components/WeeklyGrid'
import AddClassModal from '../components/AddClassModal'
import { PlusIcon, EditIcon, TrashIcon, MoreIcon } from '../config/icons'

export default function ScheduleView({ classes, onAddClass, onDeleteClass, onUpdateClass }) {
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [menuClassId, setMenuClassId] = useState(null)

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
            boxShadow: '0 4px 6px -1px color-mix(in srgb, var(--color-teal) 20%, transparent)',
            color: '#fff'
          }}
          aria-label="Nueva clase">
          <PlusIcon className="w-5 h-5" />
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
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', animationDelay: `${idx * 50}ms` }}>
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

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuClassId(menuClassId === clase.id ? null : clase.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label={`Acciones de ${clase.materia}`}
                  aria-expanded={menuClassId === clase.id}
                >
                  <MoreIcon className="w-4 h-4" />
                </button>
                {menuClassId === clase.id && (
                  <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuClassId(null)} />
                  <div className="absolute right-0 top-full mt-1 z-50 flex gap-2 p-1.5 rounded-lg border shadow-xl"
                    style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => { setEditingClass(clase); setMenuClassId(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 whitespace-nowrap"
                      style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 10%, transparent)' }}
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => { onDeleteClass(clase.id); setMenuClassId(null) }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                      style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                      aria-label={`Eliminar ${clase.materia}`}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  </>
                )}
              </div>
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
