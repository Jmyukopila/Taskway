import { loadJSON, saveJSON } from './storage'
import { STORAGE_KEYS } from '../config/constants'
import { validarPack } from './packSchema'

/* ==========================================================================
   Gestion de paquetes de temas.

   Los paquetes se sirven como archivos estaticos desde /packs/ (mismo origen
   que la app, sin backend): el catalogo lista lo disponible y cada paquete se
   descarga bajo demanda. Una vez instalado vive en localStorage, asi que
   funciona sin conexion y viaja en el backup de datos.
   ========================================================================== */

const RUTA_CATALOGO = 'packs/catalogo.json'
const RUTA_PACK = (id) => `packs/${id}.json`
const TIEMPO_LIMITE_MS = 10000
const TAMANO_MAX_BYTES = 256 * 1024

/** URL relativa a la base de la app (funciona en web y en el WebView nativo). */
function url(ruta) {
  return new URL(ruta, document.baseURI).toString()
}

async function pedirJSON(ruta) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS)
  try {
    const res = await fetch(url(ruta), { signal: control.signal, cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const texto = await res.text()
    if (texto.length > TAMANO_MAX_BYTES) throw new Error('demasiado grande')
    return JSON.parse(texto)
  } finally {
    clearTimeout(temporizador)
  }
}

/* ---------------- almacenamiento local ---------------- */

export function listarInstalados() {
  const guardados = loadJSON(STORAGE_KEYS.PACKS, [])
  if (!Array.isArray(guardados)) return []
  // Se revalida al leer: el backup pudo escribirse con otra version de la app.
  return guardados.map(p => validarPack(p)).filter(r => r.ok).map(r => r.pack)
}

function guardarInstalados(packs) {
  saveJSON(STORAGE_KEYS.PACKS, packs)
  return packs
}

/** Instala (o reemplaza) un paquete ya validado. Devuelve la lista resultante. */
export function instalarPack(pack) {
  const resto = listarInstalados().filter(p => p.id !== pack.id)
  return guardarInstalados([...resto, pack])
}

export function desinstalarPack(id) {
  return guardarInstalados(listarInstalados().filter(p => p.id !== id))
}

/* ---------------- catalogo remoto ---------------- */

/**
 * Catalogo de paquetes disponibles para descargar. Cada entrada trae solo la
 * ficha (id, nombre, descripcion, colores de muestra); el paquete completo se
 * baja al pulsar "Descargar".
 */
export async function cargarCatalogo() {
  const datos = await pedirJSON(RUTA_CATALOGO)
  const lista = Array.isArray(datos?.packs) ? datos.packs : []
  return lista
    .filter(p => typeof p?.id === 'string' && typeof p?.nombre === 'string')
    .map(p => ({
      id: p.id,
      nombre: String(p.nombre).slice(0, 40),
      descripcion: String(p.descripcion || '').slice(0, 120),
      muestra: Array.isArray(p.muestra)
        ? p.muestra.filter(c => typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c)).slice(0, 4)
        : []
    }))
}

export async function descargarPack(id) {
  const crudo = await pedirJSON(RUTA_PACK(id))
  const resultado = validarPack(crudo)
  if (!resultado.ok) throw new Error(resultado.error)
  if (resultado.pack.id !== id) throw new Error('El paquete descargado no coincide con el catalogo')
  instalarPack(resultado.pack)
  return resultado.pack
}

/* ---------------- importar / exportar archivo ---------------- */

export function importarPackDesdeArchivo(file) {
  return new Promise((resolve, reject) => {
    if (file.size > TAMANO_MAX_BYTES) {
      reject(new Error('El archivo es demasiado grande para ser un paquete'))
      return
    }
    const lector = new FileReader()
    lector.onload = (e) => {
      let crudo
      try {
        crudo = JSON.parse(e.target.result)
      } catch {
        reject(new Error('El archivo no es JSON valido'))
        return
      }
      const resultado = validarPack(crudo)
      if (!resultado.ok) {
        reject(new Error(resultado.error))
        return
      }
      instalarPack(resultado.pack)
      resolve(resultado.pack)
    }
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.readAsText(file)
  })
}

export function exportarPack(pack) {
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(blob)
  enlace.download = `taskway-pack-${pack.id}.json`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(enlace.href)
}
