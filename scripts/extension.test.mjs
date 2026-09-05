import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

/* La extensión son scripts planos (no ESM). Se evalúan con un mock de las APIs
   de WebExtensions y de fetch para comprobar el flujo end to end sin navegador. */

const SAVIO_JS = readFileSync(new URL('../extension/savio.js', import.meta.url), 'utf8')
const BACKGROUND_JS = readFileSync(new URL('../extension/background.js', import.meta.url), 'utf8')

const ICS = [
  'BEGIN:VCALENDAR', 'VERSION:2.0',
  'BEGIN:VEVENT', 'UID:e1@savio', 'SUMMARY:Taller 1', 'DTSTART:20261001T235900', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:e2@savio', 'SUMMARY:Parcial', 'DTSTART:20261010T140000', 'END:VEVENT',
  'END:VCALENDAR'
].join('\r\n')

function pick(map, keys) {
  const out = {}
  for (const k of [].concat(keys)) if (map.has(k)) out[k] = map.get(k)
  return out
}

const RETO_CF = '<!DOCTYPE html><html><head><title>Just a moment...</title></head><body>challenge-platform</body></html>'

function crearEntorno({ status = 200, respuesta = ICS } = {}) {
  const sync = new Map()
  const local = new Map()
  const listeners = { message: [], notifClick: [], tabUpdated: [] }
  const notifs = []
  const tabs = []
  const scripts = []

  const chrome = {
    runtime: {
      onMessage: { addListener: fn => listeners.message.push(fn) },
      sendMessage: (msg) => {
        listeners.message.forEach(f => f(msg, {}, () => {}))
        return Promise.resolve()
      },
      openOptionsPage: () => {}
    },
    storage: {
      sync: {
        get: k => Promise.resolve(pick(sync, k)),
        set: o => { Object.entries(o).forEach(([k, v]) => sync.set(k, v)); return Promise.resolve() },
        remove: ks => { [].concat(ks).forEach(k => sync.delete(k)); return Promise.resolve() }
      },
      local: {
        get: k => Promise.resolve(pick(local, k)),
        set: o => { Object.entries(o).forEach(([k, v]) => local.set(k, v)); return Promise.resolve() },
        remove: ks => { [].concat(ks).forEach(k => local.delete(k)); return Promise.resolve() }
      }
    },
    notifications: {
      create: (id, opts) => notifs.push({ id, opts }),
      clear: () => {},
      onClicked: { addListener: fn => listeners.notifClick.push(fn) }
    },
    tabs: {
      create: (t) => {
        const tab = { id: tabs.length + 1, ...t }
        tabs.push(tab)
        // como el navegador real: el evento 'complete' llega un poco después
        setTimeout(() => listeners.tabUpdated.forEach(f => f(tab.id, { status: 'complete' })), 5)
        return Promise.resolve(tab)
      },
      onUpdated: { addListener: fn => listeners.tabUpdated.push(fn), removeListener: () => {} }
    },
    scripting: { executeScript: (args) => { scripts.push(args); return Promise.resolve() } },
    permissions: { contains: () => Promise.resolve(true), request: () => Promise.resolve(true) },
    action: {
      _badge: '',
      setBadgeText: ({ text }) => { chrome.action._badge = text; return Promise.resolve() },
      setBadgeBackgroundColor: () => Promise.resolve()
    }
  }

  const fetch = () => Promise.resolve({ ok: status < 400, status, text: () => Promise.resolve(respuesta) })

  return { chrome, fetch, state: { sync, local, listeners, notifs, tabs, scripts } }
}

async function correrSavio(env) {
  const fn = new Function('chrome', 'fetch', 'console', `return (${SAVIO_JS.trim()})`)
  await fn(env.chrome, env.fetch, console)
  await new Promise(r => setTimeout(r, 0))
}

function cargarBackground(env) {
  new Function('chrome', 'console', BACKGROUND_JS)(env.chrome, console)
}

test('savio.js descarga el .ics, guarda los UIDs y avisa de las novedades', async () => {
  const env = crearEntorno()
  env.state.sync.set('savioUrl', 'https://savio.utb.edu.co/calendar/export_execute.php?userid=1&authtoken=x')
  cargarBackground(env)
  await correrSavio(env)

  assert.equal(env.state.local.get('savioIcs').text, ICS)
  assert.deepEqual(env.state.local.get('savioSeenUids'), ['e1@savio', 'e2@savio'])
  assert.equal(env.state.local.get('savioPendientes'), 2)
  assert.equal(env.state.local.get('savioError'), null)
  assert.equal(env.state.notifs.length, 1)
  assert.match(env.state.notifs[0].opts.message, /2 entregas nuevas/)
  assert.equal(env.chrome.action._badge, '2') // insignia con el pendiente
})

test('savio.js: si el authtoken caducó (respuesta sin calendario) marca el error', async () => {
  const env = crearEntorno({ status: 403, respuesta: '<html><body>Invalid token</body></html>' })
  env.state.sync.set('savioUrl', 'https://savio.utb.edu.co/calendar/export_execute.php?x')
  cargarBackground(env)
  await correrSavio(env)

  assert.equal(env.state.local.has('savioIcs'), false)
  assert.equal(env.state.local.get('savioError').status, 403)
  assert.equal(env.chrome.action._badge, '!')
})

test('savio.js: el reto de Cloudflare no cuenta como enlace roto', async () => {
  const env = crearEntorno({ status: 403, respuesta: RETO_CF })
  env.state.sync.set('savioUrl', 'https://savio.utb.edu.co/calendar/export_execute.php?x')
  await correrSavio(env)
  assert.equal(env.state.local.has('savioError'), false)
  assert.equal(env.state.local.has('savioIcs'), false)
})

test('savio.js no hace nada sin URL configurada ni si sincronizó hace poco', async () => {
  const env = crearEntorno()
  await correrSavio(env)
  assert.equal(env.state.local.has('savioIcs'), false)

  env.state.sync.set('savioUrl', 'https://savio.utb.edu.co/calendar/export_execute.php?x')
  env.state.local.set('savioLastSync', Date.now())
  await correrSavio(env)
  assert.equal(env.state.local.has('savioIcs'), false) // respetó el margen de 30 min
})

test('savio.js: en la segunda pasada solo cuenta como nuevos los UIDs no vistos', async () => {
  const env = crearEntorno()
  env.state.sync.set('savioUrl', 'https://savio.utb.edu.co/calendar/export_execute.php?x')
  cargarBackground(env)
  env.state.local.set('savioSeenUids', ['e1@savio'])
  await correrSavio(env)
  assert.equal(env.state.local.get('savioPendientes'), 1) // solo e2
})

test('background: "importar" abre Taskway e inyecta el .ics en su localStorage', async () => {
  const env = crearEntorno()
  env.state.sync.set('taskwayUrl', 'https://mi-taskway.vercel.app/')
  env.state.local.set('savioIcs', { text: ICS, fetchedAt: 123 })
  cargarBackground(env)

  const respuestas = []
  for (const fn of env.state.listeners.message) {
    fn({ type: 'importar' }, {}, (r) => respuestas.push(r))
  }
  await new Promise(r => setTimeout(r, 60))

  assert.equal(env.state.tabs.length, 1)
  assert.equal(env.state.tabs[0].url, 'https://mi-taskway.vercel.app/')
  assert.equal(env.state.scripts.length, 1)
  assert.deepEqual(env.state.scripts[0].args[0], { text: ICS, fetchedAt: 123 })
  const inyectado = env.state.scripts[0].func.toString()
  assert.match(inyectado, /taskway-savio-ics/)
  assert.match(inyectado, /location\.reload/)
  assert.deepEqual(respuestas, [{ ok: true }])
  assert.equal(env.state.local.get('savioPendientes'), 0)
})

test('background: "importar" sin configurar devuelve un error claro', async () => {
  const env = crearEntorno()
  cargarBackground(env)
  const respuestas = []
  for (const fn of env.state.listeners.message) fn({ type: 'importar' }, {}, r => respuestas.push(r))
  await new Promise(r => setTimeout(r, 10))
  assert.equal(respuestas[0].ok, false)
  assert.match(respuestas[0].error, /URL de Taskway/)
})
