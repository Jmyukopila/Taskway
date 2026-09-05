import assert from 'node:assert/strict'
import { test } from 'node:test'
import { emparejarMateria, eventoATarea, construirImportacion, diffImportacion, aplicarImportacion, procesarPuente } from '../src/lib/savioImport.js'

const MATERIAS = ['Cálculo Diferencial', 'Física II', 'Programación']

test('emparejarMateria: match exacto ignorando tildes, mayusculas y sufijo de grupo', () => {
  assert.equal(emparejarMateria('CÁLCULO DIFERENCIAL - GRUPO 4', MATERIAS), 'Cálculo Diferencial')
  assert.equal(emparejarMateria('FISICA II GRUPO 2', MATERIAS), 'Física II')
  assert.equal(emparejarMateria('Programación (2026-1)', MATERIAS), 'Programación')
})

test('emparejarMateria: por subcadena cuando el curso trae mas palabras', () => {
  assert.equal(emparejarMateria('Taller de Programación Avanzada', MATERIAS), 'Programación')
})

test('emparejarMateria: limpia los codigos de seccion de la UTB y empareja por solape de palabras', () => {
  const h = ['Arquitectura de Software', 'Gestión de Proyectos', 'Creatividad y Emprendimiento']
  assert.equal(emparejarMateria('ARQUITECTURA DE SOFTWARE - METACURSO 202620', h), 'Arquitectura de Software')
  assert.equal(emparejarMateria('CREATIVIDAD Y EMPRENDIMIENTO-AEMP-G04A-M-1263-202620', h), 'Creatividad y Emprendimiento')
  assert.equal(emparejarMateria('GESTION PROYECTOS TRANSFORM-MKTD-T06B-A-2368-202620', h), 'Gestión de Proyectos')
})

test('emparejarMateria: sin match devuelve el nombre limpio del curso, no vacio', () => {
  assert.equal(emparejarMateria('Cátedra Institucional', MATERIAS), 'Cátedra Institucional')
  assert.equal(emparejarMateria('', MATERIAS), '')
})

test('eventoATarea: mapea, limpia el titulo y empareja la materia', () => {
  const ev = {
    uid: 'a@savio', titulo: 'Quiz 2 is due',
    categorias: ['FÍSICA II - GRUPO 1'], url: 'https://savio.utb.edu.co/x',
    inicio: { ymd: '2026-09-20', hm: '23:59', diaCompleto: false }
  }
  assert.deepEqual(eventoATarea(ev, MATERIAS), {
    origenId: 'a@savio',
    titulo: 'Quiz 2',
    fecha: '2026-09-20',
    hora: '23:59',
    materia: 'Física II',
    descripcion: 'https://savio.utb.edu.co/x'
  })
})

test('eventoATarea: dia completo sin hora; sin fecha o sin uid devuelve null', () => {
  const base = { uid: 'b@savio', titulo: 'Entrega', categorias: [], url: '' }
  assert.equal(eventoATarea({ ...base, inicio: { ymd: '2026-10-01', hm: null, diaCompleto: true } }).hora, null)
  assert.equal(eventoATarea({ ...base, inicio: null }), null)
  assert.equal(eventoATarea({ ...base, uid: '', inicio: { ymd: '2026-10-01' } }), null)
})

test('eventoATarea: limpia los titulos reales de Moodle y salta los "Se abre"', () => {
  const con = (titulo) => eventoATarea({ uid: 'x', titulo, categorias: [], inicio: { ymd: '2026-10-01', hm: '23:55' } })
  assert.equal(con('Vencimiento de Mapa de Stakeholders').titulo, 'Mapa de Stakeholders')
  assert.equal(con('Se cierra Segundo Quiz de Conceptos').titulo, 'Segundo Quiz de Conceptos')
  assert.equal(con('LA CREATIVIDAD EN LA ERA IA pendiente').titulo, 'LA CREATIVIDAD EN LA ERA IA')
  assert.equal(con('quiz de conceptos').titulo, 'Quiz de conceptos') // capitaliza
  assert.equal(con('Se abre Segundo Quiz de Conceptos'), null) // no es un vencimiento
})

const ICS = [
  'BEGIN:VEVENT', 'UID:e1@savio', 'SUMMARY:Taller 1', 'DTSTART:20260910T235900',
  'CATEGORIES:CÁLCULO DIFERENCIAL - GRUPO 4', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:e1@savio', 'SUMMARY:Taller 1 (corregido)', 'DTSTART:20260912T235900',
  'CATEGORIES:CÁLCULO DIFERENCIAL - GRUPO 4', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:e2@savio', 'SUMMARY:Sin fecha', 'END:VEVENT'
].join('\r\n')

test('construirImportacion: deduplica por uid (gana el ultimo) y cuenta los ignorados', () => {
  const { drafts, total, ignorados } = construirImportacion(ICS, MATERIAS)
  assert.equal(total, 3)
  assert.equal(drafts.length, 1)
  assert.equal(drafts[0].fecha, '2026-09-12') // el segundo pisó al primero
  assert.equal(drafts[0].titulo, 'Taller 1 (corregido)')
  assert.equal(drafts[0].materia, 'Cálculo Diferencial')
  assert.equal(ignorados, 2)
})

test('diffImportacion: separa nuevas, cambios de fecha y las que ya estan igual', () => {
  const tasks = [
    { id: 't1', origen: 'savio', origenId: 'e1@savio', completada: false, fecha: '2026-09-10', hora: null },
    { id: 't2', origen: 'savio', origenId: 'e2@savio', completada: false, fecha: '2026-09-15', hora: null },
    { id: 't3', origen: 'savio', origenId: 'e3@savio', completada: true, fecha: '2026-09-01', hora: null }
  ]
  const drafts = [
    { origenId: 'e1@savio', fecha: '2026-09-12', hora: null, titulo: 'Taller 1' }, // movida
    { origenId: 'e2@savio', fecha: '2026-09-15', hora: null, titulo: 'Lab' },       // igual
    { origenId: 'e3@savio', fecha: '2026-09-20', hora: null, titulo: 'Vieja' },     // completada: no se toca
    { origenId: 'e9@savio', fecha: '2026-10-01', hora: null, titulo: 'Nueva' }      // nueva
  ]
  const { nuevas, cambios, sinCambios } = diffImportacion(tasks, drafts)
  assert.deepEqual(nuevas.map(d => d.origenId), ['e9@savio'])
  assert.equal(cambios.length, 1)
  assert.deepEqual(cambios[0].a, { fecha: '2026-09-12', hora: null })
  assert.equal(sinCambios, 2) // e2 igual + e3 completada
})

test('diffImportacion: una tarea creada a mano (sin origen) nunca se considera importada', () => {
  const tasks = [{ id: 'm1', titulo: 'Taller 1', fecha: '2026-09-10' }]
  const drafts = [{ origenId: 'e1@savio', fecha: '2026-09-10', hora: null, titulo: 'Taller 1' }]
  assert.equal(diffImportacion(tasks, drafts).nuevas.length, 1)
})

test('aplicarImportacion: agrega las nuevas, mueve la fecha de las cambiadas y respeta el resto', () => {
  const propia = { id: 'p1', tipo: 'tarea', titulo: 'Mia', completada: false, fecha: '2026-09-05', materia: '' }
  const savioVieja = { id: 's1', tipo: 'tarea', titulo: 'Taller 1', completada: false, fecha: '2026-09-10', hora: null, origen: 'savio', origenId: 'e1@savio' }
  const tasks = [propia, savioVieja]
  const drafts = [
    { origenId: 'e1@savio', titulo: 'Taller 1', fecha: '2026-09-13', hora: null, materia: 'Cálculo', descripcion: '' },
    { origenId: 'e2@savio', titulo: 'Parcial', fecha: '2026-09-20', hora: '14:00', materia: 'Física', descripcion: 'https://savio/x' }
  ]
  const res = aplicarImportacion(tasks, drafts)
  assert.equal(res.length, 3)
  assert.strictEqual(res[0], propia) // intacta, misma referencia
  assert.equal(res.find(t => t.id === 's1').fecha, '2026-09-13') // movida
  const nueva = res.find(t => t.origenId === 'e2@savio')
  assert.equal(nueva.materia, 'Física')
  assert.equal(nueva.origen, 'savio')
  assert.equal(nueva.hora, '14:00')
  assert.equal(nueva.completada, false)
  assert.ok(nueva.id && nueva.id !== 'e2@savio')
  // idempotente: reimportar los mismos drafts no cambia nada
  assert.strictEqual(aplicarImportacion(res, drafts), res)
})

const ICS_PUENTE = [
  'BEGIN:VCALENDAR', 'VERSION:2.0',
  'BEGIN:VEVENT', 'UID:p1@savio', 'SUMMARY:Taller nuevo', 'DTSTART:20261001T235900',
  'CATEGORIES:CÁLCULO DIFERENCIAL - GRUPO 4', 'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n')

test('procesarPuente: sin archivo o ya procesado -> null / descartar', () => {
  assert.equal(procesarPuente(null, { tasks: [], materias: [] }), null)
  assert.deepEqual(procesarPuente('{no es json', { tasks: [], materias: [] }), { descartar: true })
  const payload = JSON.stringify({ text: ICS_PUENTE, fetchedAt: 111 })
  assert.deepEqual(
    procesarPuente(payload, { tasks: [], materias: [], sync: { lastFetchedAt: 111 } }),
    { descartar: true }
  )
})

test('procesarPuente: .ics nuevo -> plan con las tareas nuevas y el sync actualizado', () => {
  const payload = JSON.stringify({ text: ICS_PUENTE, fetchedAt: 222 })
  const plan = procesarPuente(payload, { tasks: [], materias: ['Cálculo Diferencial'], sync: { lastFetchedAt: 111 } })
  assert.equal(plan.descartar, true)
  assert.equal(plan.nuevas.length, 1)
  assert.equal(plan.nuevas[0].materia, 'Cálculo Diferencial')
  assert.equal(plan.nuevoSync.lastFetchedAt, 222)
  // reimportar el mismo contenido: sin novedades
  const yaImportada = aplicarImportacion([], plan.drafts)
  const plan2 = procesarPuente(payload, { tasks: yaImportada, materias: ['Cálculo Diferencial'], sync: { lastFetchedAt: 111 } })
  assert.equal(plan2.nuevas.length, 0)
  assert.equal(plan2.cambios.length, 0)
})
