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

test('la materia de una tarea es su nombre; una tarea antigua ligada por claseId sigue el nombre vigente del horario', () => {
  const clases = [{ id: 'fisica-1', materia: 'Fisica I' }, { id: 'fisica-2', materia: 'Fisica II' }]
  // tarea nueva: solo nombre
  assert.equal(getMateriaTarea({ materia: 'Calculo I' }, clases), 'Calculo I')
  assert.equal(getMateriaTarea({ materia: '  Calculo I  ' }, clases), 'Calculo I')
  // tarea antigua ligada por claseId: gana el nombre vigente de esa clase
  assert.equal(getMateriaTarea({ claseId: 'fisica-2', materia: 'Fisica' }, clases), 'Fisica II')
  // claseId que ya no existe: cae al nombre guardado
  assert.equal(getMateriaTarea({ claseId: 'fisica-2', materia: 'Fisica' }, []), 'Fisica')
  assert.equal(getMateriaTarea({}), '')
})

test('getDatosAcademicos guarda la materia por nombre, sin claseId, y no muta la entrada', () => {
  assert.deepEqual(getDatosAcademicos({ titulo: 'Personal' }), { materia: '', calificacion: null })
  const datos = { materia: ' Calculo I ', calificacion: '4,5' }
  assert.deepEqual(getDatosAcademicos(datos), { materia: 'Calculo I', calificacion: 4.5 })
  assert.equal(datos.calificacion, '4,5')
  // el claseId de una tarea antigua no se propaga a los datos nuevos
  assert.deepEqual(getDatosAcademicos({ claseId: 'x', materia: 'Fisica', calificacion: 3 }), { materia: 'Fisica', calificacion: 3 })
})

test('una nueva recurrencia conserva la materia pero nunca copia la nota', () => {
  const tarea = { materia: 'Fisica', calificacion: 5 }
  assert.deepEqual(getDatosAcademicos(tarea, true), { materia: 'Fisica', calificacion: null })
  assert.equal(tarea.calificacion, 5)
})

test('materia y nota sobreviven a la serializacion usada por el respaldo', () => {
  const datos = getDatosAcademicos({ materia: 'Fisica', calificacion: 0 })
  const restaurado = JSON.parse(JSON.stringify(datos))
  assert.deepEqual(getDatosAcademicos(restaurado), datos)
})
