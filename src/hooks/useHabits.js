import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { hoy } from '../lib/dates'

export default function useHabits() {
  const [habits, setHabits] = useState(() => loadJSON(STORAGE_KEYS.HABITS, []))

  useEffect(() => { saveJSON(STORAGE_KEYS.HABITS, habits) }, [habits])

  const addHabit = useCallback((data) => {
    setHabits(prev => [...prev, {
      id: uid(),
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      color: data.color || '#1D9E75',
      emoji: data.emoji || 'corazon',
      completions: {},
      createdAt: hoy()
    }])
  }, [])

  const toggleHabit = useCallback((id) => {
    const today = hoy()
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const completions = { ...h.completations || h.completions }
      if (completions[today]) {
        delete completions[today]
      } else {
        completions[today] = true
      }
      return { ...h, completions }
    }))
  }, [])

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  return { habits, addHabit, toggleHabit, deleteHabit }
}
