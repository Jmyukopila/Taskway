/* ==========================================================================
   Materias del horario.

   El horario guarda "clases": sesiones con dia y hora. Una misma materia puede
   tener varias (Calculo I los lunes y los miercoles son dos clases). El area
   Academico razona por MATERIA, no por sesion: aqui se deduplican por nombre.
   ========================================================================== */

/** Nombre de materia normalizado: string sin espacios sobrantes, '' si no hay. */
export function normalizarMateria(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

/**
 * Materias unicas del horario, ordenadas. Cada una lleva un color (el de su
 * primera sesion) y la lista de sesiones que la componen.
 */
export function materiasDelHorario(clases = []) {
  const map = new Map()
  for (const clase of clases) {
    const nombre = normalizarMateria(clase.materia)
    if (!nombre) continue
    if (!map.has(nombre)) {
      map.set(nombre, { nombre, color: clase.color || null, sesiones: [] })
    }
    map.get(nombre).sesiones.push(clase)
  }
  return [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/** Solo los nombres, deduplicados y ordenados. */
export function nombresMaterias(clases = []) {
  return materiasDelHorario(clases).map(m => m.nombre)
}

/** ¿Sigue existiendo esta materia como clase del horario? */
export function materiaExiste(nombre, clases = []) {
  const objetivo = normalizarMateria(nombre)
  return !!objetivo && clases.some(c => normalizarMateria(c.materia) === objetivo)
}
