import { useEffect, useRef } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { nombresMaterias } from '../lib/materias'
import { procesarPuente, CLAVE_PUENTE } from '../lib/savioImport'
import { permisoConcedido, enviarNotificacion } from '../utils/pushNotifications'

/**
 * Puente con la extensión de navegador de Taskway. La extensión escribe el .ics
 * de SAVIO en localStorage['taskway-savio-ics']; aquí, al abrir la app, se
 * importa lo nuevo una sola vez por sesión.
 */
export default function useSavioBridge({ classes, tasks, importarSavio }) {
  const hecho = useRef(false)

  useEffect(() => {
    if (hecho.current) return
    let crudo
    try { crudo = localStorage.getItem(CLAVE_PUENTE) } catch { return }
    if (!crudo) return
    hecho.current = true

    const plan = procesarPuente(crudo, {
      tasks,
      materias: nombresMaterias(classes),
      sync: loadJSON(STORAGE_KEYS.SAVIO_SYNC, {})
    })

    try { localStorage.removeItem(CLAVE_PUENTE) } catch { /* ignore */ }
    if (!plan || (!plan.nuevas?.length && !plan.cambios?.length)) return

    importarSavio(plan.drafts)
    saveJSON(STORAGE_KEYS.SAVIO_SYNC, plan.nuevoSync)

    if (plan.nuevas.length > 0 && permisoConcedido()) {
      enviarNotificacion(
        'Taskway',
        `${plan.nuevas.length} ${plan.nuevas.length === 1 ? 'tarea nueva' : 'tareas nuevas'} de SAVIO`,
        'savio-bridge'
      )
    }
  }, [classes, tasks, importarSavio])
}
