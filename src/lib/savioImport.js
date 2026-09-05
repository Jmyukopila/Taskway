import { parseICS } from './ical.js'
import { uid } from './id.js'
import { hoy } from './dates.js'

/* ==========================================================================
   Traduce el calendario exportado de SAVIO (Moodle) a tareas de Taskway.

   Cada VEVENT con fecha se vuelve una tarea; el curso (CATEGORIES) se empareja
   con una materia del horario si se puede. El UID del evento es la huella para
   no duplicar en importaciones sucesivas.
   ========================================================================== */

/** Normaliza un nombre de curso/materia para compararlo: sin tildes, mayusculas,
    sin sufijos de grupo/periodo ni parentesis. */
function clave(texto) {
  return (texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(GRUPO|GRP|PARALELO|SECCION|SECION|NRC)\s*[:.-]?\s*\w+/g, ' ')
    .replace(/\b\d{4}\s*-\s*\d\b/g, ' ')
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Empareja el nombre de un curso con una materia del horario. Devuelve el
    nombre EXACTO de la materia del horario si hay match, o el curso limpio. */
export function emparejarMateria(curso, materiasHorario = []) {
  const bruto = (curso || '').trim()
  if (!bruto) return ''
  const objetivo = clave(bruto)
  if (!objetivo) return bruto

  let mejorParcial = ''
  for (const materia of materiasHorario) {
    const k = clave(materia)
    if (!k) continue
    if (k === objetivo) return materia
    if ((k.length >= 4 && objetivo.includes(k)) || (objetivo.length >= 4 && k.includes(objetivo))) {
      if (k.length > clave(mejorParcial).length) mejorParcial = materia
    }
  }
  return mejorParcial || bruto
}

const SUFIJOS_TITULO = [
  / is due$/i, / vence$/i, / se debe entregar$/i, / debe enviarse$/i,
  / cierra$/i, / \(vence\)$/i, / - fecha de entrega$/i, / fecha de entrega$/i
]

function limpiarTitulo(titulo) {
  let t = (titulo || '').trim()
  for (const re of SUFIJOS_TITULO) t = t.replace(re, '').trim()
  return t || 'Tarea'
}

/** Un evento -> borrador de tarea, o null si no sirve (sin fecha). */
export function eventoATarea(evento, materiasHorario = []) {
  if (!evento?.inicio?.ymd || !evento.uid) return null
  return {
    origenId: evento.uid,
    titulo: limpiarTitulo(evento.titulo),
    fecha: evento.inicio.ymd,
    hora: evento.inicio.diaCompleto ? null : (evento.inicio.hm || null),
    materia: emparejarMateria(evento.categorias[0] || '', materiasHorario),
    descripcion: evento.url || ''
  }
}

/**
 * Texto .ics -> { drafts, total, ignorados }. Deduplica por origenId (gana el
 * ultimo) por si el export trae el mismo evento repetido.
 */
export function construirImportacion(icsText, materiasHorario = []) {
  const eventos = parseICS(icsText)
  const porId = new Map()
  for (const ev of eventos) {
    const draft = eventoATarea(ev, materiasHorario)
    if (draft) porId.set(draft.origenId, draft)
  }
  const drafts = [...porId.values()]
  return { drafts, total: eventos.length, ignorados: eventos.length - drafts.length }
}

/**
 * Compara los borradores con las tareas actuales:
 *   nuevas    -> aun no importadas (por origenId)
 *   cambios   -> ya importadas, sin completar, con fecha u hora distinta
 *   sinCambios-> ya importadas e iguales
 */
export function diffImportacion(tasks = [], drafts = []) {
  const porOrigen = new Map(
    tasks.filter(t => t.origen === 'savio' && t.origenId).map(t => [t.origenId, t])
  )
  const nuevas = []
  const cambios = []
  let sinCambios = 0

  for (const d of drafts) {
    const existente = porOrigen.get(d.origenId)
    if (!existente) { nuevas.push(d); continue }
    const mismaFecha = existente.fecha === d.fecha
    const mismaHora = (existente.hora || null) === (d.hora || null)
    if (!existente.completada && (!mismaFecha || !mismaHora)) {
      cambios.push({
        id: existente.id,
        titulo: existente.titulo,
        de: { fecha: existente.fecha, hora: existente.hora || null },
        a: { fecha: d.fecha, hora: d.hora || null }
      })
    } else {
      sinCambios++
    }
  }
  return { nuevas, cambios, sinCambios }
}

/**
 * Aplica una importacion sobre la lista de tareas: mueve la fecha de las que
 * cambiaron y agrega las nuevas. Devuelve la lista nueva (o la misma si nada
 * cambia). No toca tareas completadas ni ajenas a SAVIO.
 */
export function aplicarImportacion(tasks = [], drafts = []) {
  const { nuevas, cambios } = diffImportacion(tasks, drafts)
  if (!nuevas.length && !cambios.length) return tasks
  const porId = new Map(cambios.map(c => [c.id, c]))
  const actualizadas = tasks.map(t => {
    const c = porId.get(t.id)
    return c ? { ...t, fecha: c.a.fecha, hora: c.a.hora } : t
  })
  const creadas = nuevas.map(d => ({
    id: uid(),
    tipo: 'tarea',
    titulo: d.titulo,
    descripcion: d.descripcion || '',
    completada: false,
    fecha: d.fecha,
    hora: d.hora || null,
    prioridad: 'media',
    subtasks: [],
    recurrencia: null,
    materia: d.materia || '',
    calificacion: null,
    origen: 'savio',
    origenId: d.origenId,
    createdAt: hoy()
  }))
  return [...actualizadas, ...creadas]
}

/** Clave de handoff que escribe la extension de navegador en el localStorage
    de Taskway (no es una STORAGE_KEYS: es transitoria). */
export const CLAVE_PUENTE = 'taskway-savio-ics'

/**
 * Procesa el .ics que dejó la extensión. Devuelve el plan de importación y el
 * nuevo estado de sync, o null si no hay nada que hacer (sin archivo, ya
 * procesado, o sin novedades).
 *   crudo  -> string JSON { text, fetchedAt } (lo que hay en CLAVE_PUENTE)
 *   sync   -> { lastFetchedAt } guardado en STORAGE_KEYS.SAVIO_SYNC
 */
export function procesarPuente(crudo, { tasks = [], materias = [], sync = {} }) {
  if (!crudo) return null
  let payload
  try { payload = JSON.parse(crudo) } catch { return { descartar: true } }
  if (!payload || typeof payload.text !== 'string') return { descartar: true }
  if (payload.fetchedAt && sync.lastFetchedAt === payload.fetchedAt) return { descartar: true }

  const { drafts } = construirImportacion(payload.text, materias)
  const { nuevas, cambios } = diffImportacion(tasks, drafts)
  return {
    descartar: true,
    drafts,
    nuevas,
    cambios,
    nuevoSync: { lastFetchedAt: payload.fetchedAt || Date.now(), at: Date.now() }
  }
}
