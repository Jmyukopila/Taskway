import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { uid } from '../lib/id'
import { PLANTILLA_CORTES, renombrarEnNotas, quitarDeNotas } from '../lib/notas'
import { normalizarMateria } from '../lib/materias'

/* Estructura persistida en STORAGE_KEYS.NOTAS:
   { [nombreMateria]: { cortes: [ { id, nombre, peso, items: [ { id, nombre, nota, peso } ] } ] } }
   La materia se identifica por su NOMBRE (deduplicado del horario). Renombrar o
   borrar una materia en el horario mueve o elimina su entrada aqui. */

const MATERIA_VACIA = { cortes: [] }

/** 1.2.0 guardaba las notas por claseId; ahora por nombre de materia. */
function migrarDesdeClaseId(guardado) {
  const claves = Object.keys(guardado || {})
  if (claves.length === 0) return {}
  const clasesPorId = new Map(
    loadJSON(STORAGE_KEYS.CLASSES, []).map(c => [c.id, normalizarMateria(c.materia)])
  )
  // Si ninguna clave coincide con un id de clase, ya esta en el formato nuevo.
  if (!claves.some(k => clasesPorId.has(k))) return guardado
  const salida = {}
  for (const [clave, valor] of Object.entries(guardado)) {
    const nombre = clasesPorId.get(clave) || clave
    if (!nombre) continue
    const cortes = valor?.cortes || []
    salida[nombre] = salida[nombre]
      ? { cortes: [...salida[nombre].cortes, ...cortes] }
      : { cortes: [...cortes] }
  }
  return salida
}

export default function useNotas() {
  const [notas, setNotas] = useState(() => migrarDesdeClaseId(loadJSON(STORAGE_KEYS.NOTAS, {})))

  useEffect(() => { saveJSON(STORAGE_KEYS.NOTAS, notas) }, [notas])

  const getMateria = useCallback(
    (nombre) => notas[normalizarMateria(nombre)] || MATERIA_VACIA,
    [notas]
  )

  const mutarCortes = useCallback((nombre, fn) => {
    const clave = normalizarMateria(nombre)
    if (!clave) return
    setNotas(prev => ({
      ...prev,
      [clave]: { ...prev[clave], cortes: fn(prev[clave]?.cortes || []) }
    }))
  }, [])

  const usarPlantilla = useCallback((nombre) => {
    mutarCortes(nombre, () => PLANTILLA_CORTES.map(c => ({ ...c, id: uid(), items: [] })))
  }, [mutarCortes])

  const addCorte = useCallback((nombre) => {
    mutarCortes(nombre, cortes => [
      ...cortes,
      { id: uid(), nombre: `Corte ${cortes.length + 1}`, peso: 0, items: [] }
    ])
  }, [mutarCortes])

  const updateCorte = useCallback((nombre, corteId, cambios) => {
    mutarCortes(nombre, cortes => cortes.map(c => c.id === corteId ? { ...c, ...cambios } : c))
  }, [mutarCortes])

  const deleteCorte = useCallback((nombre, corteId) => {
    mutarCortes(nombre, cortes => cortes.filter(c => c.id !== corteId))
  }, [mutarCortes])

  const addItem = useCallback((nombre, corteId, item) => {
    mutarCortes(nombre, cortes => cortes.map(c =>
      c.id === corteId ? { ...c, items: [...(c.items || []), { ...item, id: uid() }] } : c
    ))
  }, [mutarCortes])

  const updateItem = useCallback((nombre, corteId, itemId, cambios) => {
    mutarCortes(nombre, cortes => cortes.map(c =>
      c.id === corteId
        ? { ...c, items: (c.items || []).map(i => i.id === itemId ? { ...i, ...cambios } : i) }
        : c
    ))
  }, [mutarCortes])

  const deleteItem = useCallback((nombre, corteId, itemId) => {
    mutarCortes(nombre, cortes => cortes.map(c =>
      c.id === corteId ? { ...c, items: (c.items || []).filter(i => i.id !== itemId) } : c
    ))
  }, [mutarCortes])

  /** Renombrar una materia en el horario arrastra sus notas. */
  const renombrarMateria = useCallback((viejo, nuevo) => {
    setNotas(prev => renombrarEnNotas(prev, viejo, nuevo))
  }, [])

  /** Borrar la ultima clase de una materia se lleva sus notas. */
  const eliminarMateria = useCallback((nombre) => {
    setNotas(prev => quitarDeNotas(prev, nombre))
  }, [])

  return {
    notas, getMateria, usarPlantilla,
    addCorte, updateCorte, deleteCorte,
    addItem, updateItem, deleteItem,
    renombrarMateria, eliminarMateria
  }
}
