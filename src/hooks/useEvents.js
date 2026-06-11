import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { hoy } from '../lib/dates'
import { pedirPermiso, enviarNotificacion } from '../utils/pushNotifications'

const NOTIFIED_KEY = 'taskway-event-notified'

function yaNotificado(eventId, type) {
  const list = loadJSON(NOTIFIED_KEY, [])
  return list.some(n => n.id === eventId && n.type === type)
}

function marcarNotificado(eventId, type) {
  const list = loadJSON(NOTIFIED_KEY, [])
  if (!list.some(n => n.id === eventId && n.type === type)) {
    list.push({ id: eventId, type })
    saveJSON(NOTIFIED_KEY, list)
  }
}

function checkEventNotifications(events) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const today = hoy()

  events.forEach(ev => {
    if (ev.fecha === today) {
      if (!yaNotificado(ev.id, 'event-day')) {
        enviarNotificacion('Taskway', `Hoy: "${ev.titulo}" — evento especial`, `ev-day-${ev.id}`)
        marcarNotificado(ev.id, 'event-day')
      }
    }

    if (ev.recordatorioDias) {
      const eventDate = new Date(ev.fecha + 'T00:00:00')
      const remindDate = new Date(eventDate)
      remindDate.setDate(remindDate.getDate() - ev.recordatorioDias)
      const remindStr = remindDate.toISOString().slice(0, 10)
      if (remindStr === today) {
        if (!yaNotificado(ev.id, 'event-reminder')) {
          const label = ev.recordatorioDias === 1 ? 'mañana' :
                        ev.recordatorioDias === 7 ? 'en una semana' :
                        `en ${ev.recordatorioDias} días`
          enviarNotificacion('Taskway', `"${ev.titulo}" ${label}`, `ev-rem-${ev.id}`)
          marcarNotificado(ev.id, 'event-reminder')
        }
      }
    }
  })
}

export default function useEvents() {
  const [events, setEvents] = useState(() => loadJSON(STORAGE_KEYS.EVENTS, []))

  useEffect(() => { saveJSON(STORAGE_KEYS.EVENTS, events) }, [events])

  useEffect(() => {
    pedirPermiso().then(granted => {
      if (granted) checkEventNotifications(events)
    })

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkEventNotifications(events)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [events])

  const addEvent = useCallback((data) => {
    const nuevo = {
      id: uid(),
      titulo: data.titulo,
      descripcion: data.descripcion || '',
      fecha: data.fecha,
      recordatorioDias: data.recordatorioDias || null,
      color: data.color || '#F59E0B'
    }
    setEvents(prev => [...prev, nuevo])
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(ev => ev.id !== id))
  }, [])

  const updateEvent = useCallback((id, cambios) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...cambios } : ev))
  }, [])

  return { events, addEvent, deleteEvent, updateEvent }
}
