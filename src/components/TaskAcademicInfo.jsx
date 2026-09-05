import { formatearCalificacion, getMateriaTarea } from '../lib/academico'

export default function TaskAcademicInfo({ tarea, classes = [] }) {
  const materia = getMateriaTarea(tarea, classes)
  const notaTexto = formatearCalificacion(tarea.calificacion)

  if (!materia && !notaTexto) return null

  return (
    <div className="mt-1.5 space-y-0.5">
      {materia && (
        <p className="text-xs break-words" style={{ color: 'var(--ui-calendar-muted)' }}>
          Materia: {materia}
        </p>
      )}
      {notaTexto ? (
        <p className="text-xs" style={{ color: 'var(--ui-calendar-muted)' }}>
          Nota: {notaTexto}
        </p>
      ) : materia && (
        <p className="text-xs" style={{ color: 'var(--ui-calendar-muted)' }}>
          Pendiente de calificar
        </p>
      )}
    </div>
  )
}
