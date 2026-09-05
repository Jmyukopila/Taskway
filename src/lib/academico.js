import { normalizarMateria } from './materias.js'

export function normalizarCalificacion(valor) {
  if (valor == null || (typeof valor === 'string' && !valor.trim())) return null
  const texto = typeof valor === 'string' ? valor.trim() : null
  const numero = texto === null ? valor : Number(texto.replace(',', '.'))
  if ((texto !== null && !/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(texto)) ||
      typeof numero !== 'number' || !Number.isFinite(numero) || numero < 0 || numero > 5) {
    throw new Error('Introduce una nota entre 0 y 5, por ejemplo 4,5.')
  }
  return numero
}

/**
 * Nombre de la materia de una tarea. Si sigue ligada a una clase del horario
 * (tareas antiguas), gana el nombre vigente de esa clase, asi un cambio en el
 * horario se refleja sin tocar la tarea. Si no, el nombre guardado en la tarea.
 */
export function getMateriaTarea(tarea, clases = []) {
  if (tarea.claseId) {
    const clase = clases.find(c => c.id === tarea.claseId)
    if (clase) return normalizarMateria(clase.materia)
  }
  return normalizarMateria(tarea.materia)
}

export function formatearCalificacion(valor) {
  try {
    const nota = normalizarCalificacion(valor)
    return nota === null ? null : `${nota.toLocaleString('es', { maximumFractionDigits: 20 })} / 5`
  } catch {
    return null
  }
}

/**
 * Campos academicos de una tarea. La materia es un nombre que debe coincidir
 * con una del horario; se guarda tal cual (normalizado). Las tareas nuevas ya
 * no llevan claseId: el vinculo es por nombre.
 */
export function getDatosAcademicos(datos, recurrente = false) {
  return {
    materia: normalizarMateria(datos.materia),
    calificacion: recurrente ? null : normalizarCalificacion(datos.calificacion)
  }
}
