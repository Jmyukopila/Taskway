import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { PLANTILLA_CORTES } from '../lib/notas'

/* Estructura persistida en STORAGE_KEYS.NOTAS:
   { [claseId]: { cortes: [ { id, nombre, peso, items: [ { id, nombre, nota, peso } ] } ] } }
   La materia se identifica por su clase del horario; al borrar la clase, `prune`
   se lleva su entrada. */

const MATERIA_VACIA = { cortes: [] }

export default function useNotas() {
  const [notas, setNotas] = useState(() => loadJSON(STORAGE_KEYS.NOTAS, {}))

  useEffect(() => { saveJSON(STORAGE_KEYS.NOTAS, notas) }, [notas])

  const getMateria = useCallback((claseId) => notas[claseId] || MATERIA_VACIA, [notas])

  const mutarCortes = useCallback((claseId, fn) => {
    setNotas(prev => {
      const cortes = fn(prev[claseId]?.cortes || [])
      return { ...prev, [claseId]: { ...prev[claseId], cortes } }
    })
  }, [])

  const usarPlantilla = useCallback((claseId) => {
    mutarCortes(claseId, () => PLANTILLA_CORTES.map(c => ({ ...c, id: uid(), items: [] })))
  }, [mutarCortes])

  const addCorte = useCallback((claseId) => {
    mutarCortes(claseId, cortes => [
      ...cortes,
      { id: uid(), nombre: `Corte ${cortes.length + 1}`, peso: 0, items: [] }
    ])
  }, [mutarCortes])

  const updateCorte = useCallback((claseId, corteId, cambios) => {
    mutarCortes(claseId, cortes => cortes.map(c => c.id === corteId ? { ...c, ...cambios } : c))
  }, [mutarCortes])

  const deleteCorte = useCallback((claseId, corteId) => {
    mutarCortes(claseId, cortes => cortes.filter(c => c.id !== corteId))
  }, [mutarCortes])

  const addItem = useCallback((claseId, corteId, item) => {
    mutarCortes(claseId, cortes => cortes.map(c =>
      c.id === corteId ? { ...c, items: [...(c.items || []), { ...item, id: uid() }] } : c
    ))
  }, [mutarCortes])

  const updateItem = useCallback((claseId, corteId, itemId, cambios) => {
    mutarCortes(claseId, cortes => cortes.map(c =>
      c.id === corteId
        ? { ...c, items: (c.items || []).map(i => i.id === itemId ? { ...i, ...cambios } : i) }
        : c
    ))
  }, [mutarCortes])

  const deleteItem = useCallback((claseId, corteId, itemId) => {
    mutarCortes(claseId, cortes => cortes.map(c =>
      c.id === corteId ? { ...c, items: (c.items || []).filter(i => i.id !== itemId) } : c
    ))
  }, [mutarCortes])

  /** Descarta las materias cuya clase ya no existe en el horario. */
  const prune = useCallback((claseIdsValidos) => {
    setNotas(prev => {
      const validos = new Set(claseIdsValidos)
      const conservadas = Object.keys(prev).filter(id => validos.has(id))
      if (conservadas.length === Object.keys(prev).length) return prev
      return Object.fromEntries(conservadas.map(id => [id, prev[id]]))
    })
  }, [])

  return {
    notas, getMateria, usarPlantilla,
    addCorte, updateCorte, deleteCorte,
    addItem, updateItem, deleteItem,
    prune
  }
}
