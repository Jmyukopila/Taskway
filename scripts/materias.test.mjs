import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizarMateria, materiasDelHorario, nombresMaterias, materiaExiste } from '../src/lib/materias.js'

test('normalizarMateria recorta y tolera lo que no es texto', () => {
  assert.equal(normalizarMateria('  Calculo I  '), 'Calculo I')
  assert.equal(normalizarMateria(''), '')
  assert.equal(normalizarMateria(null), '')
  assert.equal(normalizarMateria(undefined), '')
  assert.equal(normalizarMateria(42), '')
})

test('materiasDelHorario deduplica por nombre: varias sesiones son una materia', () => {
  const clases = [
    { id: 'c1', materia: 'Calculo I', color: '#111', diasSemana: ['lunes'] },
    { id: 'c2', materia: 'Calculo I', color: '#222', diasSemana: ['miércoles'] },
    { id: 'c3', materia: 'Fisica II', color: '#333', diasSemana: ['martes'] },
    { id: 'c4', materia: '  ', color: '#444' }
  ]
  const materias = materiasDelHorario(clases)
  assert.deepEqual(materias.map(m => m.nombre), ['Calculo I', 'Fisica II'])
  assert.equal(materias[0].sesiones.length, 2)
  assert.equal(materias[0].color, '#111') // el color de la primera sesion
  assert.deepEqual(nombresMaterias(clases), ['Calculo I', 'Fisica II'])
})

test('materiasDelHorario ordena alfabeticamente y aguanta lista vacia', () => {
  const clases = [{ id: 'z', materia: 'Zoologia' }, { id: 'a', materia: 'Algebra' }]
  assert.deepEqual(nombresMaterias(clases), ['Algebra', 'Zoologia'])
  assert.deepEqual(materiasDelHorario([]), [])
  assert.deepEqual(materiasDelHorario(), [])
})

test('materiaExiste comprueba contra el horario, normalizando', () => {
  const clases = [{ id: 'c1', materia: 'Calculo I' }]
  assert.equal(materiaExiste('Calculo I', clases), true)
  assert.equal(materiaExiste('  Calculo I  ', clases), true)
  assert.equal(materiaExiste('Calculo II', clases), false)
  assert.equal(materiaExiste('', clases), false)
})
