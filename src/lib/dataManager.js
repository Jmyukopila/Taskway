import { STORAGE_KEYS } from '../config/constants'
import { loadJSON } from './storage'

const DATA_VERSION = 1

function getFilename() {
  const d = new Date()
  const fecha = d.toISOString().split('T')[0]
  return `mi-dia-backup-${fecha}.json`
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
    app: 'Mi Dia',
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

        if (!payload || payload.app !== 'Mi Dia') {
          reject(new Error('El archivo no es un backup valido de Mi Dia'))
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

        Object.entries(data).forEach(([key, value]) => {
          if (value !== null) {
            try {
              localStorage.setItem(key, JSON.stringify(value))
            } catch {
              // skip if key not recognized
            }
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
