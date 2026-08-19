import { STORAGE_KEYS } from '../config/constants'
import { loadJSON } from './storage'
import { hoy } from './dates'

const DATA_VERSION = 1

function getFilename() {
  return `taskway-backup-${hoy()}.json`
}

export function exportarDatos() {
  const data = {}
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      data[key] = loadJSON(key, null)
    } catch {
      data[key] = null
    }
  })

  const payload = {
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'Taskway',
    data
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getFilename()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importarDatos(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result)

        if (!payload || payload.app !== 'Taskway') {
          reject(new Error('El archivo no es un backup valido de Taskway'))
          return
        }

        if (!payload.version || payload.version > DATA_VERSION) {
          reject(new Error('El archivo fue creado con una version mas reciente de la app. Actualiza la app primero.'))
          return
        }

        const { data } = payload
        if (!data) {
          reject(new Error('El archivo no contiene datos validos'))
          return
        }

        // Solo se restauran claves conocidas: un backup manipulado no deberia
        // poder escribir cualquier cosa en el localStorage de la app.
        const permitidas = new Set(Object.values(STORAGE_KEYS))
        Object.entries(data).forEach(([key, value]) => {
          if (value === null || !permitidas.has(key)) return
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch {
            // cuota llena o valor no serializable: se ignora esa clave
          }
        })

        resolve()
      } catch {
        reject(new Error('No se pudo leer el archivo. Asegurate de que es un backup valido.'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}
