import { normalizarCalificacion } from './academico.js'

/* ==========================================================================
   Notas por materia: cortes con peso, items dentro de cada corte y la
   definitiva que sale de todo eso. Escala 0-5, la misma de las tareas.

   Las notas que vienen de las tareas (`notasDeTareas`) se muestran aparte y
   NO entran en ningun calculo de aqui: son un registro de solo lectura.
   ========================================================================== */

/** Plantilla habitual en la universidad colombiana. El hook le pone id y items. */
export const PLANTILLA_CORTES = [
  { nombre: 'Corte 1', peso: 30 },
  { nombre: 'Corte 2', peso: 30 },
  { nombre: 'Corte 3', peso: 40 }
]

function redondear(n) {
  return Math.round(n * 100) / 100
}

/**
 * Media ponderada de entradas `{ nota, peso }`. Descarta las que no tienen nota
 * todavia (`null`) y las de peso <= 0, y normaliza por la suma de los pesos que
 * si cuentan: asi un corte con un solo parcial calificado ya da una nota
 * parcial coherente en vez de hundirse. Devuelve `null` si no queda nada.
 */
export function promedioPonderado(entradas) {
  let suma = 0
  let pesos = 0
  for (const { nota, peso } of entradas) {
    if (nota == null || !(peso > 0)) continue
    suma += nota * peso
    pesos += peso
  }
  return pesos > 0 ? redondear(suma / pesos) : null
}

/** Nota de un corte a partir de sus items. `null` si aun no tiene ninguno calificado. */
export function notaCorte(corte) {
  return promedioPonderado((corte?.items || []).map(i => ({ nota: i.nota, peso: i.peso })))
}

/**
 * Definitiva proyectada: media de las notas de corte disponibles, ponderada por
 * el peso de cada corte y normalizada por los cortes que ya tienen algo. Es lo
 * que llevas hasta ahora, no una prediccion de los cortes que faltan.
 */
export function definitivaProyectada(cortes = []) {
  return promedioPonderado(cortes.map(c => ({ nota: notaCorte(c), peso: c.peso })))
}

/**
 * Definitiva al dia de hoy: los cortes sin calificar cuentan como cero sobre el
 * total de pesos. Es el minimo asegurado con lo ya entregado.
 */
export function definitivaActual(cortes = []) {
  const total = cortes.reduce((s, c) => s + (c.peso > 0 ? c.peso : 0), 0)
  if (total <= 0) return null
  const suma = cortes.reduce((s, c) => {
    const n = notaCorte(c)
    return s + (n == null ? 0 : n * c.peso)
  }, 0)
  return redondear(suma / total)
}

/** Suma de los pesos de los cortes. Sirve para avisar si no llega (o pasa de) 100. */
export function pesoTotal(cortes = []) {
  return redondear(cortes.reduce((s, c) => s + (Number.isFinite(c.peso) ? c.peso : 0), 0))
}

/** Valida un peso en porcentaje (0-100). Acepta coma o punto. */
export function validarPeso(valor) {
  const texto = typeof valor === 'string' ? valor.trim().replace(',', '.') : valor
  const numero = Number(texto)
  if (texto === '' || texto == null || !Number.isFinite(numero) || numero < 0 || numero > 100) {
    throw new Error('El peso va de 0 a 100.')
  }
  return redondear(numero)
}

/** Los items de nota usan la misma escala 0-5 y el mismo validador que las tareas. */
export function validarNota(valor) {
  return normalizarCalificacion(valor)
}

/**
 * Notas sacadas de las tareas de una materia (identificada por su clase del
 * horario). Solo lectura: se listan para tenerlas a la vista, no se mezclan con
 * los cortes.
 */
export function notasDeTareas(tasks = [], claseId) {
  if (!claseId) return { items: [], promedio: null }
  const items = tasks
    .filter(t => t.claseId === claseId && t.calificacion != null)
    .map(t => ({ id: t.id, nombre: t.titulo, nota: t.calificacion, fecha: t.fecha || null }))
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  const promedio = items.length
    ? redondear(items.reduce((s, i) => s + i.nota, 0) / items.length)
    : null
  return { items, promedio }
}

/** Todo lo que necesita la tarjeta de una materia, en una sola pasada. */
export function resumenMateria(materia, tasks, claseId) {
  const cortes = materia?.cortes || []
  return {
    cortes: cortes.map(c => ({ ...c, nota: notaCorte(c) })),
    pesoTotal: pesoTotal(cortes),
    definitivaProyectada: definitivaProyectada(cortes),
    definitivaActual: definitivaActual(cortes),
    notasTareas: notasDeTareas(tasks, claseId)
  }
}
