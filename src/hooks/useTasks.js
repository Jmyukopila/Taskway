import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { generarProximaFechaRecurrente, hoy } from '../lib/dates'

const notifTimeouts = new Map()

function programarNotif(tarea) {
  cancelarNotif(tarea.id)
  if (!tarea.hora || tarea.completada) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const [hh, mm] = tarea.hora.split(':')
  const fechaHora = new Date(`${tarea.fecha}T${hh}:${mm}:00`)
  const diezAntes = fechaHora.getTime() - 10 * 60 * 1000
  const diff = diezAntes - Date.now()
  if (diff <= 0) return

  const id = setTimeout(() => {
    new Notification('Mi Día', {
      body: `📌 "${tarea.titulo}" comienza en 10 minutos`,
      tag: tarea.id
    })
    notifTimeouts.delete(tarea.id)
  }, diff)
  notifTimeouts.set(tarea.id, id)
}

function cancelarNotif(id) {
  if (notifTimeouts.has(id)) {
    clearTimeout(notifTimeouts.get(id))
    notifTimeouts.delete(id)
  }
}

export default function useTasks() {
  const [tasks, setTasks] = useState(() => loadJSON(STORAGE_KEYS.TASKS, []))

  useEffect(() => { saveJSON(STORAGE_KEYS.TASKS, tasks) }, [tasks])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    tasks.forEach(t => programarNotif(t))
    return () => {
      for (const [id] of notifTimeouts) cancelarNotif(id)
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
      createdAt: hoy()
    }
    setTasks(prev => [...prev, nueva])
  }, [])

  const toggleTask = useCallback((id) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t
        if (t.completada) return { ...t, completada: false }

        const updated = { ...t, completada: true }

        // Si es recurrente, generar siguiente instancia
        if (t.recurrencia) {
          const proxFecha = generarProximaFechaRecurrente(t.fecha, t.recurrencia)
          if (proxFecha && proxFecha !== t.fecha) {
            const instancia = {
              id: uid(),
              tipo: 'tarea',
              titulo: t.titulo,
              descripcion: t.descripcion,
              completada: false,
              fecha: proxFecha,
              hora: t.hora,
              prioridad: t.prioridad,
              subtasks: t.subtasks.map(s => ({ ...s, completada: false })),
              recurrencia: t.recurrencia,
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...cambios } : t))
  }, [])

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completada: !s.completada } : s
        )
      }
    }))
  }, [])

  return { tasks, addTask, toggleTask, deleteTask, updateTask, toggleSubtask }
}
