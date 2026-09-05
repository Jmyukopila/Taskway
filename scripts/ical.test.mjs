import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseICS } from '../src/lib/ical.js'

const CAL = [
  'BEGIN:VCALENDAR',
  'PRODID:-//Moodle Pty Ltd//NONSGML Moodle Version 2024042200//EN',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'UID:1234567@savio.utb.edu.co',
  'SUMMARY:Taller 3 se debe entregar',
  'DESCRIPTION:<p>Entrega del taller\\, sección A.</p>\\n<a href="https://savio.',
  ' utb.edu.co/mod/assign/view.php?id=98765">Ver</a>',
  'DTSTAMP:20260905T000000Z',
  'DTSTART:20260910T235900Z',
  'DTEND:20260910T235900Z',
  'CATEGORIES:CÁLCULO DIFERENCIAL - GRUPO 4',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:2222@savio.utb.edu.co',
  'SUMMARY:Semana de receso',
  'DTSTART;VALUE=DATE:20260916',
  'DTEND;VALUE=DATE:20260917',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:3333@savio.utb.edu.co',
  'SUMMARY:Clase de laboratorio',
  'DTSTART;TZID=America/Bogota:20260912T140000',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:4444@savio.utb.edu.co',
  'SUMMARY:Evento sin fecha',
  'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n')

test('parsea un VEVENT de Moodle: uid, titulo, enlace, categoria y fecha UTC a local', () => {
  const eventos = parseICS(CAL)
  const e = eventos.find(x => x.uid === '1234567@savio.utb.edu.co')
  assert.ok(e)
  assert.equal(e.titulo, 'Taller 3 se debe entregar')
  assert.equal(e.url, 'https://savio.utb.edu.co/mod/assign/view.php?id=98765') // linea desplegada
  assert.deepEqual(e.categorias, ['CÁLCULO DIFERENCIAL - GRUPO 4'])
  assert.match(e.descripcion, /Entrega del taller, sección A\./) // \\, desescapado, HTML fuera
  // 20260910T235900Z -> local, sea cual sea la zona del runner
  const d = new Date(Date.UTC(2026, 8, 10, 23, 59, 0))
  const esperado = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  assert.equal(e.inicio.ymd, esperado)
  assert.equal(e.inicio.diaCompleto, false)
})

test('VALUE=DATE es un evento de dia completo, sin hora', () => {
  const e = parseICS(CAL).find(x => x.uid === '2222@savio.utb.edu.co')
  assert.deepEqual(e.inicio, { ymd: '2026-09-16', hm: null, diaCompleto: true })
})

test('una hora con TZID se toma como hora de pared local', () => {
  const e = parseICS(CAL).find(x => x.uid === '3333@savio.utb.edu.co')
  assert.deepEqual(e.inicio, { ymd: '2026-09-12', hm: '14:00', diaCompleto: false })
})

test('un evento sin DTSTART se lista pero con inicio null (lo filtra la capa de importacion)', () => {
  const e = parseICS(CAL).find(x => x.uid === '4444@savio.utb.edu.co')
  assert.ok(e)
  assert.equal(e.inicio, null)
})

test('entradas vacias o que no son iCalendar devuelven lista vacia', () => {
  assert.deepEqual(parseICS(''), [])
  assert.deepEqual(parseICS('cualquier cosa'), [])
  assert.deepEqual(parseICS(null), [])
})

test('desescapa comas, puntos y coma y saltos de linea en el titulo', () => {
  const cal = 'BEGIN:VEVENT\r\nUID:x\r\nSUMMARY:Parte 1\\; Parte 2\\, fin\r\nDTSTART:20260101\r\nEND:VEVENT'
  assert.equal(parseICS(cal)[0].titulo, 'Parte 1; Parte 2, fin')
})
