import NotasMateria from './NotasMateria'
import { EmptyIcon } from '../config/icons'

export default function NotasView({ tasks, classes, notas }) {
  return (
    <div className="flex-1 px-4 pb-24 overflow-y-auto">
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <EmptyIcon className="w-16 h-16 mb-3" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <p className="text-sm text-center max-w-[240px]" style={{ color: 'var(--color-muted)' }}>
            Agrega tus materias en Horario para llevar sus notas de corte aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
          <p className="text-xs pb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Cada materia lleva sus cortes con su peso. La definitiva proyectada usa solo los cortes que ya tienen nota.
          </p>
          {classes.map((clase, idx) => (
            <div key={clase.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
              <NotasMateria
                clase={clase}
                materia={notas.getMateria(clase.id)}
                tasks={tasks}
                acciones={notas}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
