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

export function getMateriaTarea(tarea, clases = []) {
  const clase = clases.find(c => c.id === tarea.claseId)
  return clase?.materia || (typeof tarea.materia === 'string' ? tarea.materia : '')
}

export function formatearCalificacion(valor) {
  try {
    const nota = normalizarCalificacion(valor)
    return nota === null ? null : `${nota.toLocaleString('es', { maximumFractionDigits: 20 })} / 5`
  } catch {
    return null
  }
}

export function getDatosAcademicos(datos, recurrente = false) {
  const claseId = typeof datos.claseId === 'string' && datos.claseId ? datos.claseId : null
  return {
    claseId,
    materia: claseId && typeof datos.materia === 'string' ? datos.materia.trim() : '',
    calificacion: recurrente ? null : normalizarCalificacion(datos.calificacion)
  }
}
