import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { getIconSet, ICONOS_FAMILIA } from '../src/config/iconSets.js'
import { motivoDesdeSpec } from '../src/config/iconMotivos.js'
import { validarPack } from '../src/lib/packSchema.js'

const FAMILIAS = ['clasico', 'flora', 'acero']
const ICONOS_PESTANA = ['hoy', 'calendario', 'habitos', 'horario', 'tareas', 'dashboard', 'academico']

function assertPathValida(d, contexto) {
  assert.equal(typeof d, 'string', contexto)
  assert.ok(d.length > 0, contexto)
  assert.doesNotMatch(d, /NaN/, contexto)
  assert.match(d, /^M/, contexto)
}

function assertSetValido(set, contexto) {
  for (const nombre of ICONOS_PESTANA) {
    const icono = set[nombre]
    for (const d of icono.outline) assertPathValida(d, `${contexto}/${nombre}/outline`)
    if (icono.solid.cut) assertPathValida(icono.solid.cut, `${contexto}/${nombre}/solid.cut`)
    for (const d of icono.solid.extra) assertPathValida(d, `${contexto}/${nombre}/solid.extra`)
  }
  for (const [nombre, d] of Object.entries(set.utilidades)) assertPathValida(d, `${contexto}/utilidades/${nombre}`)
  for (const [nombre, d] of Object.entries(set.temas)) assertPathValida(d, `${contexto}/temas/${nombre}`)
}

test('motivoDesdeSpec traduce arcos A segun semantica SVG: radios escalan, rotacion y banderas intactas, solo el punto final se traslada', () => {
  const spec = [[['M', -1, 0], ['A', 1, 0.5, 30, 1, 0, 1, 0], ['Z']]]
  const motivo = motivoDesdeSpec(spec)
  const d = motivo(10, 20, 4)
  assert.equal(d, 'M6 20A4 2 30 1 0 14 20z')
})

test('motivoDesdeSpec no produce NaN con radios, flags y rotaciones variados', () => {
  const spec = [[
    ['M', 0, -1],
    ['A', 0.6, 0.3, 275, 0, 1, 0.8, 0.2],
    ['A', 1.2, 1.2, 0, 1, 1, -0.8, 0.2],
    ['Z']
  ]]
  const motivo = motivoDesdeSpec(spec)
  const d = motivo(12, 12, 3.4)
  assert.doesNotMatch(d, /NaN/)
  assert.match(d, /^M[\d.-]+ [\d.-]+A/)
})

for (const familia of FAMILIAS) {
  test(`getIconSet(${familia}) no produce NaN en ningun icono`, () => {
    assertSetValido(getIconSet(familia, null), familia)
  })
}

test('ICONOS_FAMILIA no produce NaN', () => {
  for (const familia of FAMILIAS) {
    for (const d of ICONOS_FAMILIA[familia]) assertPathValida(d, `familia/${familia}`)
  }
})

test('getIconSet cachea sets integrados por clave familia.variante: misma familia devuelve la misma referencia', () => {
  const a = getIconSet('acero', 'guerra')
  const b = getIconSet('acero', 'guerra')
  assert.equal(a, b)
})

const rutaWarrior = new URL('../public/packs/warrior.json', import.meta.url)
const crudoWarrior = JSON.parse(readFileSync(rutaWarrior, 'utf8'))

test('el pack Warrior es valido para ambos modos', () => {
  const resultado = validarPack(crudoWarrior)
  assert.equal(resultado.ok, true, resultado.error)
  const { pack } = resultado
  assert.equal(pack.id, 'warrior')
  assert.equal(pack.base, 'acero')
  for (const modo of ['dark', 'light']) {
    assert.ok(Object.keys(pack.colores[modo]).length > 0, `colores.${modo}`)
    assert.ok(pack.fondo[modo].capas.length > 0, `fondo.${modo}.capas`)
  }
})

test('el pack Warrior produce iconos y trazos de contorno/relleno sin NaN', () => {
  const { pack } = validarPack(crudoWarrior)
  assertSetValido(getIconSet(pack.base, null, pack), 'warrior')
})

test('el motivo de Warrior es una sola espada cerrada sin comandos degenerados', () => {
  const { pack } = validarPack(crudoWarrior)
  assert.equal(pack.motivo.length, 1)
  const subpath = pack.motivo[0]
  assert.equal(subpath[0][0], 'M')
  assert.equal(subpath.at(-1)[0], 'Z')
})

test('getIconSet cachea packs por identidad de objeto: reimportar el mismo id no devuelve el set anterior', () => {
  const primero = validarPack(crudoWarrior).pack
  const setPrimero = getIconSet(primero.base, null, primero)

  const segundoCrudo = JSON.parse(JSON.stringify(crudoWarrior))
  segundoCrudo.motivo = [[['M', 0, -1], ['L', 1, 1], ['L', -1, 1], ['Z']]]
  const segundo = validarPack(segundoCrudo).pack
  assert.equal(segundo.id, primero.id)
  assert.notEqual(segundo, primero)

  const setSegundo = getIconSet(segundo.base, null, segundo)
  assert.notEqual(setPrimero, setSegundo)
  assert.notEqual(setPrimero.hoy.outline.at(-1), setSegundo.hoy.outline.at(-1))

  const setPrimeroOtraVez = getIconSet(primero.base, null, primero)
  assert.equal(setPrimero, setPrimeroOtraVez)
})
