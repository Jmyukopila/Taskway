import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  promedioPonderado, notaCorte, definitivaProyectada, definitivaActual,
  pesoTotal, validarPeso, validarNota, notasDeTareas, resumenMateria, PLANTILLA_CORTES,
  renombrarEnNotas, quitarDeNotas
} from '../src/lib/notas.js'

test('la plantilla de cortes suma 100', () => {
  assert.equal(PLANTILLA_CORTES.reduce((s, c) => s + c.peso, 0), 100)
})

test('promedioPonderado normaliza por los pesos que si cuentan e ignora notas ausentes', () => {
  assert.equal(promedioPonderado([{ nota: 3.5, peso: 60 }, { nota: 4, peso: 40 }]), 3.7)
  // el item sin nota no arrastra el promedio hacia abajo
  assert.equal(promedioPonderado([{ nota: 4, peso: 50 }, { nota: null, peso: 50 }]), 4)
  // pesos que no suman 100: se normaliza igual
  assert.equal(promedioPonderado([{ nota: 3, peso: 10 }, { nota: 5, peso: 10 }]), 4)
  // peso cero o negativo: fuera
  assert.equal(promedioPonderado([{ nota: 2, peso: 0 }, { nota: 4, peso: 5 }]), 4)
})

test('promedioPonderado devuelve null cuando no hay nada calificado', () => {
  assert.equal(promedioPonderado([]), null)
  assert.equal(promedioPonderado([{ nota: null, peso: 30 }, { nota: null, peso: 70 }]), null)
})

test('notaCorte pondera los items del corte', () => {
  assert.equal(notaCorte({ items: [{ nota: 3.5, peso: 60 }, { nota: 4, peso: 40 }] }), 3.7)
  assert.equal(notaCorte({ items: [] }), null)
  assert.equal(notaCorte(undefined), null)
})

const cortesEjemplo = [
  { peso: 30, items: [{ nota: 3.5, peso: 60 }, { nota: 4, peso: 40 }] }, // 3.7
  { peso: 30, items: [{ nota: 4.1, peso: 100 }] },                       // 4.1
  { peso: 40, items: [] }                                                // sin calificar
]

test('definitivaProyectada solo cuenta los cortes con nota y normaliza por su peso', () => {
  // (3.7*30 + 4.1*30) / 60 = 3.9
  assert.equal(definitivaProyectada(cortesEjemplo), 3.9)
  assert.equal(definitivaProyectada([]), null)
})

test('definitivaActual trata los cortes sin nota como cero sobre el total de pesos', () => {
  // (3.7*30 + 4.1*30 + 0*40) / 100 = 2.34
  assert.equal(definitivaActual(cortesEjemplo), 2.34)
  assert.equal(definitivaActual([{ peso: 0, items: [] }]), null)
})

test('pesoTotal suma los pesos de los cortes', () => {
  assert.equal(pesoTotal(cortesEjemplo), 100)
  assert.equal(pesoTotal([{ peso: 30 }, { peso: 30 }]), 60)
  assert.equal(pesoTotal([]), 0)
})

for (const [entrada, esperado] of [['30', 30], ['33,5', 33.5], [0, 0], [100, 100], [' 40 ', 40]]) {
  test(`validarPeso acepta ${JSON.stringify(entrada)}`, () => {
    assert.equal(validarPeso(entrada), esperado)
  })
}

for (const entrada of ['', '  ', null, undefined, -1, 101, 'abc', NaN, Infinity, {}]) {
  test(`validarPeso rechaza ${String(entrada)}`, () => {
    assert.throws(() => validarPeso(entrada), /0 a 100/)
  })
}

test('validarNota reutiliza la escala 0-5 de las tareas', () => {
  assert.equal(validarNota('4,5'), 4.5)
  assert.equal(validarNota(''), null)
  assert.throws(() => validarNota('6'), /0.*5/)
})

test('notasDeTareas toma solo las tareas calificadas de esa materia (por nombre), sin mezclar otras', () => {
  const clases = [{ id: 'fis1', materia: 'Fisica' }, { id: 'fis2', materia: 'Fisica' }, { id: 'mate1', materia: 'Calculo' }]
  const tasks = [
    { id: 'a', materia: 'Fisica', titulo: 'Lab 1', calificacion: 4.5, fecha: '2026-03-01' },
    { id: 'b', claseId: 'fis2', titulo: 'Lab 2', calificacion: 3.5, fecha: '2026-04-01' }, // ligada a otra sesion de la misma materia
    { id: 'c', materia: 'Fisica', titulo: 'Sin nota', calificacion: null, fecha: '2026-05-01' },
    { id: 'd', materia: 'Calculo', titulo: 'Otra materia', calificacion: 5, fecha: '2026-03-01' }
  ]
  const { items, promedio } = notasDeTareas(tasks, 'Fisica', clases)
  assert.deepEqual(items.map(i => i.id), ['b', 'a']) // mas reciente primero, y las dos sesiones cuentan como una materia
  assert.equal(promedio, 4)
  assert.deepEqual(notasDeTareas(tasks, null, clases), { items: [], promedio: null })
  assert.deepEqual(notasDeTareas(tasks, 'Ingles', clases), { items: [], promedio: null })
})

test('resumenMateria junta cortes, definitiva y notas de tareas en una pasada', () => {
  const materia = { cortes: cortesEjemplo }
  const tasks = [{ id: 'a', materia: 'Fisica', titulo: 'Taller', calificacion: 5, fecha: '2026-03-01' }]
  const r = resumenMateria(materia, tasks, 'Fisica')
  assert.equal(r.cortes[0].nota, 3.7)
  assert.equal(r.cortes[2].nota, null)
  assert.equal(r.pesoTotal, 100)
  assert.equal(r.definitivaProyectada, 3.9)
  assert.equal(r.definitivaActual, 2.34)
  assert.equal(r.notasTareas.promedio, 5)
  assert.equal(r.notasTareas.items.length, 1)
})

test('renombrarEnNotas mueve la entrada y no toca el original', () => {
  const notas = { 'Calculo I': { cortes: [{ id: 'a' }] }, 'Fisica': { cortes: [{ id: 'b' }] } }
  const r = renombrarEnNotas(notas, 'Calculo I', 'Calculo Diferencial')
  assert.deepEqual(Object.keys(r).sort(), ['Calculo Diferencial', 'Fisica'])
  assert.deepEqual(r['Calculo Diferencial'].cortes, [{ id: 'a' }])
  assert.ok(notas['Calculo I']) // sin mutar
  // renombrar hacia una materia que ya tiene notas: se juntan los cortes
  const fusion = renombrarEnNotas(notas, 'Calculo I', 'Fisica')
  assert.deepEqual(fusion['Fisica'].cortes.map(c => c.id), ['b', 'a'])
  // casos que no hacen nada
  assert.equal(renombrarEnNotas(notas, 'Calculo I', 'Calculo I'), notas)
  assert.equal(renombrarEnNotas(notas, 'Inexistente', 'X'), notas)
  assert.equal(renombrarEnNotas(notas, 'Calculo I', '  '), notas)
})

test('quitarDeNotas elimina la entrada sin mutar el original', () => {
  const notas = { 'Calculo I': { cortes: [] }, 'Fisica': { cortes: [] } }
  assert.deepEqual(Object.keys(quitarDeNotas(notas, 'Calculo I')), ['Fisica'])
  assert.deepEqual(Object.keys(quitarDeNotas(notas, '  Fisica  ')), ['Calculo I'])
  assert.equal(quitarDeNotas(notas, 'Inexistente'), notas)
  assert.ok(notas['Calculo I'])
})

test('resumenMateria aguanta una materia sin datos', () => {
  const r = resumenMateria(undefined, [], 'Fisica')
  assert.deepEqual(r.cortes, [])
  assert.equal(r.definitivaProyectada, null)
  assert.equal(r.definitivaActual, null)
  assert.equal(r.notasTareas.promedio, null)
})
