import { useState } from 'react'
import NotasMateria from './NotasMateria'
import AddClassModal from './AddClassModal'
import { materiasDelHorario } from '../lib/materias'
import { EmptyIcon, PlusIcon } from '../config/icons'

export default function NotasView({ tasks, classes, notas, onAddClass }) {
  const [nuevaMateria, setNuevaMateria] = useState(false)
  const materias = materiasDelHorario(classes)

  return (
    <div className="flex-1 px-4 pb-24 overflow-y-auto">
      {materias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <EmptyIcon className="w-16 h-16 mb-3" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <p className="text-sm text-center max-w-[240px] mb-4" style={{ color: 'var(--color-muted)' }}>
            Las notas se llevan por materia del Horario. Agrega una para empezar.
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
        <div className="space-y-2.5 pt-1">
          <p className="text-xs pb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Una tarjeta por materia del Horario. La definitiva proyectada usa solo los cortes que ya tienen nota.
          </p>
          {materias.map((m, idx) => (
            <div key={m.nombre} className="animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
              <NotasMateria
                nombre={m.nombre}
                color={m.color}
                notasMateria={notas.getMateria(m.nombre)}
                tasks={tasks}
                classes={classes}
                acciones={notas}
              />
            </div>
          ))}
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

      {nuevaMateria && (
        <AddClassModal onClose={() => setNuevaMateria(false)} onAdd={onAddClass} />
      )}
    </div>
  )
}
