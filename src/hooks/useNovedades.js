import { useCallback, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { CAMBIOS, VERSION_ACTUAL, compararVersiones } from '../config/changelog'

/** Version supuesta para quien ya usaba la app antes de que existiera el registro. */
const VERSION_PREVIA = '0.0.0'

/** ¿Hay datos de la app en el dispositivo? Distingue a quien ya la usaba. */
function instalacionExistente() {
  return Object.entries(STORAGE_KEYS)
    .filter(([nombre]) => nombre !== 'VERSION_VISTA')
    .some(([, clave]) => localStorage.getItem(clave) !== null)
}

/**
 * Decide si toca ensenar el registro de cambios.
 *
 * La version vista se lee (y se siembra) en el inicializador del estado, no en
 * un efecto. Hay tres casos:
 *  - ya hay una version guardada: se muestran las entradas posteriores;
 *  - no hay version pero si datos de la app: es alguien que venia de una
 *    version anterior al registro, asi que le toca ver todo lo nuevo;
 *  - no hay nada: instalacion nueva, no hay nada que contar.
 */
export default function useNovedades() {
  const [versionVista, setVersionVista] = useState(() => {
    try {
      const guardada = localStorage.getItem(STORAGE_KEYS.VERSION_VISTA)
      if (guardada) return guardada
      if (instalacionExistente()) return VERSION_PREVIA
      localStorage.setItem(STORAGE_KEYS.VERSION_VISTA, VERSION_ACTUAL)
    } catch {
      // sin localStorage (modo privado): se comporta como instalacion nueva
    }
    return VERSION_ACTUAL
  })

  const [modo, setModo] = useState(null) // null | 'auto' | 'manual'

  const pendientes = useMemo(
    () => CAMBIOS.filter(c => compararVersiones(c.version, versionVista) > 0),
    [versionVista]
  )

  const marcarVisto = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSION_VISTA, VERSION_ACTUAL)
    } catch { /* sin almacenamiento: se volvera a mostrar */ }
    setVersionVista(VERSION_ACTUAL)
  }, [])

  const abrirHistorial = useCallback(() => setModo('manual'), [])

  const cerrar = useCallback(() => {
    setModo('cerrado')
    marcarVisto()
  }, [marcarVisto])

  const abierto = modo === 'manual' || (modo === null && pendientes.length > 0)
  const entradas = modo === 'manual' ? CAMBIOS : pendientes

  return { abierto, entradas, abrirHistorial, cerrar, version: VERSION_ACTUAL }
}
