import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, readdirSync } from 'node:fs'
import { TEMAS, getVisualTokens } from '../src/config/themes.js'
import { FAMILIAS } from '../src/config/estilos.js'

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
  return channels.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

const packs = readdirSync(new URL('../public/packs/', import.meta.url))
  .filter(name => name !== 'catalogo.json' && name.endsWith('.json'))
  .map(name => JSON.parse(readFileSync(new URL(`../public/packs/${name}`, import.meta.url), 'utf8')))

for (const modo of ['light', 'dark']) {
  const palettes = Object.entries(TEMAS).flatMap(([name, tema]) => [
    [name, tema[modo]],
    ...FAMILIAS.flatMap(f => (f.variantes || []).map(v => [`${name}/${v.key}`, { ...tema[modo], ...v.colors }]))
  ])
  palettes.push(...packs.map(p => [p.id, { ...TEMAS.default[modo], ...p.colores[modo] }]))
  for (const [name, palette] of palettes) {
    test(`${name}/${modo}: calendario e iconos mantienen contraste AA`, () => {
      const tokens = getVisualTokens(palette, 'clasico')
      for (const key of ['calendar-text', 'calendar-muted', 'calendar-accent', 'calendar-task', 'calendar-event', 'icon', 'icon-muted']) {
        assert.ok(contrast(tokens[key], tokens['calendar-surface']) >= 4.5, `${key}: ${tokens[key]}`)
      }
      assert.ok(contrast(tokens['on-accent'], tokens['calendar-selected']) >= 4.5)
      assert.ok(contrast(tokens['on-event'], tokens['calendar-event']) >= 4.5)
    })
  }
}

test('cada familia conserva su lenguaje de formas', () => {
  const get = familia => getVisualTokens(TEMAS.default.dark, familia)['control-radius']
  assert.notEqual(get('flora'), get('acero'))
  assert.notEqual(get('clasico'), get('acero'))
  assert.equal(get('desconocida'), get('clasico'))
})

test('paletas importadas con hex corto y transparencia generan colores opacos', () => {
  const tokens = getVisualTokens({ ...TEMAS.default.light, teal: '#ff000033', card: '#ffffff88', purple: '#abc', warning: '#12345678' }, 'flora')
  for (const key of ['calendar-selected', 'calendar-surface', 'calendar-task', 'calendar-event', 'on-accent']) {
    assert.match(tokens[key], /^#[0-9a-f]{6}$/i)
  }
  assert.ok(contrast(tokens['on-accent'], tokens['calendar-selected']) >= 4.5)
})

test('Warrior conserva el carmesi y alterna la tinta de seleccion segun el modo', () => {
  const warrior = packs.find(p => p.id === 'warrior')
  for (const modo of ['light', 'dark']) {
    const palette = warrior.colores[modo]
    const tokens = getVisualTokens(palette, warrior.base)
    assert.equal(tokens['calendar-selected'], palette.teal)
    assert.equal(tokens['calendar-accent'], palette.teal)
    assert.equal(tokens.icon, palette.teal)
    assert.equal(tokens['on-accent'], modo === 'light' ? '#ffffff' : '#000000')
  }
})

test('los acentos ilegibles se ajustan sin modificar la paleta ni el relleno seleccionado', () => {
  const palette = { ...TEMAS.default.light, teal: '#ffffff' }
  const before = { ...palette }
  const tokens = getVisualTokens(palette, 'clasico')
  assert.notEqual(tokens.icon, palette.teal)
  assert.equal(tokens['calendar-selected'], '#ffffff')
  assert.equal(tokens['on-accent'], '#000000')
  assert.deepEqual(palette, before)
})
