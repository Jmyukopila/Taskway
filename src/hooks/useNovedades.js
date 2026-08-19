import { useCallback, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { CAMBIOS, VERSION_ACTUAL, compararVersiones } from '../config/changelog'

/**
 * Decide si toca ensenar el registro de cambios.
 *
 * La version vista se lee (y se siembra) en el inicializador del estado, no en
 * un efecto: en una instalacion nueva no hay nada que contar, asi que se marca
 * la version actual como vista y el usuario no recibe un changelog de bienvenida.
 */
export default function useNovedades() {
  const [versionVista, setVersionVista] = useState(() => {
    let guardada = null
    try {
      guardada = localStorage.getItem(STORAGE_KEYS.VERSION_VISTA)
      if (!guardada) localStorage.setItem(STORAGE_KEYS.VERSION_VISTA, VERSION_ACTUAL)
    } catch {
      // sin localStorage (modo privado): se comporta como instalacion nueva
    }
    return guardada || VERSION_ACTUAL
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
