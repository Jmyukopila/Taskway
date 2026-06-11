import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'

export default function useClasses() {
  const [classes, setClasses] = useState(() => loadJSON(STORAGE_KEYS.CLASSES, []))

  useEffect(() => { saveJSON(STORAGE_KEYS.CLASSES, classes) }, [classes])

  const addClass = useCallback((clase) => {
    setClasses(prev => [...prev, { ...clase, id: uid() }])
  }, [])

  const deleteClass = useCallback((id) => {
    setClasses(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateClass = useCallback((id, cambios) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...cambios } : c))
  }, [])

  return { classes, addClass, deleteClass, updateClass }
}
