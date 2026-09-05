import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizarCalificacion, getMateriaTarea, formatearCalificacion, getDatosAcademicos } from '../src/lib/academico.js'

for (const [entrada, esperada] of [[null, null], [undefined, null], ['', null], ['  ', null], [0, 0], ['0', 0], [5, 5], ['5,0', 5], ['4,5', 4.5], [' 4.75 ', 4.75], [3.85, 3.85]]) {
  test(`normaliza la nota ${JSON.stringify(entrada)} sin confundir cero con vacio`, () => {
    assert.equal(normalizarCalificacion(entrada), esperada)
  })
}

for (const entrada of [-0.1, 5.01, '6', 'abc', '4,5.2', '1e0', '0x5', true, {}, [], NaN, Infinity]) {
  test(`rechaza la calificacion invalida ${String(entrada)}`, () => {
    assert.throws(() => normalizarCalificacion(entrada), /0.*5/)
  })
}

test('formatea notas en español incluyendo cero y omite valores ausentes o invalidos', () => {
  assert.equal(formatearCalificacion(4.5), '4,5 / 5')
  assert.equal(formatearCalificacion(0), '0 / 5')
  assert.equal(formatearCalificacion(5), '5 / 5')
  assert.equal(formatearCalificacion(null), null)
  assert.equal(formatearCalificacion(undefined), null)
  assert.equal(formatearCalificacion('incorrecto'), null)
})

test('resuelve la materia por id, no por nombre, y refleja cambios del horario', () => {
  const tarea = { claseId: 'fisica-2', materia: 'Fisica' }
  const clases = [{ id: 'fisica-1', materia: 'Fisica I' }, { id: 'fisica-2', materia: 'Fisica II' }]
  assert.equal(getMateriaTarea(tarea, clases), 'Fisica II')
  assert.equal(getMateriaTarea(tarea, []), 'Fisica')
  assert.equal(getMateriaTarea({}), '')
})

test('crea campos opcionales compatibles con tareas antiguas y no muta la entrada', () => {
  assert.deepEqual(getDatosAcademicos({ titulo: 'Personal' }), { claseId: null, materia: '', calificacion: null })
  const datos = { claseId: 'fisica', materia: ' Fisica ', calificacion: '4,5' }
  assert.deepEqual(getDatosAcademicos(datos), { claseId: 'fisica', materia: 'Fisica', calificacion: 4.5 })
  assert.equal(datos.calificacion, '4,5')
  assert.equal(getDatosAcademicos({ materia: 'No seleccionada' }).materia, '')
})

test('una nueva recurrencia conserva la materia pero nunca copia la nota', () => {
  const tarea = { claseId: 'fisica', materia: 'Fisica', calificacion: 5 }
  assert.deepEqual(getDatosAcademicos(tarea, true), { claseId: 'fisica', materia: 'Fisica', calificacion: null })
  assert.equal(tarea.calificacion, 5)
})

test('materia y nota sobreviven a la serializacion usada por el respaldo', () => {
  const datos = getDatosAcademicos({ claseId: 'fisica', materia: 'Fisica', calificacion: 0 })
  const restaurado = JSON.parse(JSON.stringify(datos))
  assert.deepEqual(getDatosAcademicos(restaurado), datos)
})
