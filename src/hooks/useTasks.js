import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { generarProximaFechaRecurrente, hoy } from '../lib/dates'
import { getDatosAcademicos, normalizarCalificacion } from '../lib/academico'
import { permisoConcedido, enviarNotificacion, enviarNotificacionDesdeSW, suscribirPush, playAlarm } from '../utils/pushNotifications'

const PENDING_KEY = 'taskway-pending-notifs'
const notifTimeouts = new Map()

function guardarPendiente(tarea, timestamp) {
  // Reemplaza por id: el efecto reprograma en cada cambio de tareas y, si se
  // acumulasen duplicados, al recuperar se dispararia una notificacion por copia.
  const pendientes = loadJSON(PENDING_KEY, []).filter(p => p.id !== tarea.id)
  pendientes.push({ id: tarea.id, title: tarea.titulo, time: tarea.hora, fecha: tarea.fecha, timestamp })
  saveJSON(PENDING_KEY, pendientes)
}

function limpiarPendiente(id) {
  const pendientes = loadJSON(PENDING_KEY, []).filter(p => p.id !== id)
  saveJSON(PENDING_KEY, pendientes)
}

function recuperarPendientes() {
  const pendientes = loadJSON(PENDING_KEY, [])
  if (pendientes.length === 0) return
  const ahora = Date.now()
  const vencidas = pendientes.filter(p => p.timestamp <= ahora)
  if (vencidas.length === 0) return
  vencidas.forEach(p => {
    enviarNotificacion('Taskway', `"${p.title}" — tarea pendiente de hace rato`, p.id)
    playAlarm()
    limpiarPendiente(p.id)
  })
  // guardar las que aún no vencen
  const futuras = pendientes.filter(p => p.timestamp > ahora)
  saveJSON(PENDING_KEY, futuras)
}

function programarNotif(tarea) {
  cancelarNotif(tarea.id)
  if (!tarea.hora || tarea.completada) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const [hh, mm] = tarea.hora.split(':')
  const fechaHora = new Date(`${tarea.fecha}T${hh}:${mm}:00`)
  const diezAntes = fechaHora.getTime() - 10 * 60 * 1000
  const diff = diezAntes - Date.now()
  if (diff <= 0) return

  guardarPendiente(tarea, diezAntes)

  const id = setTimeout(() => {
    enviarNotificacionDesdeSW({ title: 'Taskway', body: `"${tarea.titulo}" comienza en 10 minutos`, tag: tarea.id })
      .catch(() => {
        enviarNotificacion('Taskway', `"${tarea.titulo}" comienza en 10 minutos`, tarea.id)
        playAlarm()
      })
    notifTimeouts.delete(tarea.id)
    limpiarPendiente(tarea.id)
  }, diff)
  notifTimeouts.set(tarea.id, id)
}

function cancelarNotif(id) {
  if (notifTimeouts.has(id)) {
    clearTimeout(notifTimeouts.get(id))
    notifTimeouts.delete(id)
  }
  limpiarPendiente(id)
}

export default function useTasks() {
  const [tasks, setTasks] = useState(() => loadJSON(STORAGE_KEYS.TASKS, []))
  const [alarmEnabled, setAlarmEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ALARM_ENABLED)
    return stored !== null ? stored === 'true' : true
  })

  useEffect(() => { saveJSON(STORAGE_KEYS.TASKS, tasks) }, [tasks])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ALARM_ENABLED, alarmEnabled) }, [alarmEnabled])

  useEffect(() => {
    // No se pide permiso al cargar: el navegador lo rechaza fuera de un gesto
    // del usuario. Se solicita desde Configuracion.
    if (permisoConcedido()) {
      suscribirPush()
      recuperarPendientes()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        recuperarPendientes()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const handleSWMessage = (event) => {
      if (event.data?.type === 'play-alarm') playAlarm()
    }
    const sw = 'serviceWorker' in navigator ? navigator.serviceWorker : null
    sw?.addEventListener('message', handleSWMessage)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      sw?.removeEventListener('message', handleSWMessage)
    }
  }, [])

  useEffect(() => {
    tasks.forEach(t => programarNotif(t))
    return () => {
      // Solo se limpian los temporizadores en memoria: la lista persistida es
      // la que permite recuperar avisos vencidos tras cerrar la app.
      for (const id of notifTimeouts.values()) clearTimeout(id)
      notifTimeouts.clear()
    }
  }, [tasks])

  const addTask = useCallback((data) => {
    const nueva = {
      id: uid(),
      tipo: 'tarea',
      titulo: data.titulo,
      descripcion: data.descripcion || '',
      completada: false,
      fecha: data.fecha || hoy(),
      hora: data.hora || null,
      prioridad: data.prioridad || 'media',
      subtasks: data.subtasks || [],
      recurrencia: data.recurrencia || null,
      ...getDatosAcademicos(data),
      createdAt: hoy()
    }
    setTasks(prev => [...prev, nueva])
  }, [])

  const toggleTask = useCallback((id) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t
        if (t.completada) return { ...t, completada: false, completadaEn: null }

        const today = hoy()
        const updated = { ...t, completada: true, completadaEn: today }

        if (t.recurrencia) {
          const proxFecha = generarProximaFechaRecurrente(t.fecha, t.recurrencia)
          if (proxFecha && proxFecha !== t.fecha) {
            const instancia = {
              id: uid(),
              tipo: 'tarea',
              titulo: t.titulo,
              descripcion: t.descripcion,
              completada: false,
              completadaEn: null,
              fecha: proxFecha,
              hora: t.hora,
              prioridad: t.prioridad,
              subtasks: (t.subtasks || []).map(s => ({ ...s, completada: false })),
              recurrencia: t.recurrencia,
              ...getDatosAcademicos(t, true),
              createdAt: hoy()
            }
            return [updated, instancia]
          }
        }
        return updated
      }).flat()
    )
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTask = useCallback((id, cambios) => {
    const actualizacion = { ...cambios }
    if (Object.hasOwn(actualizacion, 'calificacion')) {
      actualizacion.calificacion = normalizarCalificacion(actualizacion.calificacion)
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...actualizacion } : t))
  }, [])

  /** Renombrar una materia en el horario: las tareas ligadas a ella (por nombre)
      pasan al nombre nuevo. */
  const renombrarMateria = useCallback((viejo, nuevo) => {
    const v = (viejo || '').trim()
    const n = (nuevo || '').trim()
    if (!v || !n || v === n) return
    setTasks(prev => {
      let cambio = false
      const siguiente = prev.map(t => {
        if ((t.materia || '').trim() !== v) return t
        cambio = true
        return { ...t, materia: n }
      })
      return cambio ? siguiente : prev
    })
  }, [])

  /** Borrar una clase del horario: sus tareas antiguas pierden el claseId pero
      conservan la materia como texto. */
  const desvincularClase = useCallback((claseId) => {
    setTasks(prev => {
      let cambio = false
      const siguiente = prev.map(t => {
        if (t.claseId !== claseId) return t
        cambio = true
        const copia = { ...t }
        delete copia.claseId
        return copia
      })
      return cambio ? siguiente : prev
    })
  }, [])

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: (t.subtasks || []).map(s =>
          s.id === subtaskId ? { ...s, completada: !s.completada } : s
        )
      }
    }))
  }, [])

  return { tasks, addTask, toggleTask, deleteTask, updateTask, toggleSubtask, renombrarMateria, desvincularClase, alarmEnabled, setAlarmEnabled }
}
