/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { TEMAS } from '../config/themes'
import { FAMILIAS, getVariante } from '../config/estilos'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'

const ThemeContext = createContext()

function applyTheme(temaKey, modo, familia, variante) {
  const tema = TEMAS[temaKey]
  if (!tema) return

  const root = document.documentElement
  const baseVars = tema[modo]
  if (baseVars) {
    Object.entries(baseVars).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val)
    })
  }

  // Apply variante color overrides
  if (familia && variante) {
    const v = getVariante(familia, variante)
    if (v?.colors) {
      Object.entries(v.colors).forEach(([key, val]) => {
        root.style.setProperty(`--color-${key}`, val)
      })
    }
  }

  root.setAttribute('data-theme', `${temaKey}-${modo}`)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', baseVars?.fondo || '#0f0f0f')
}

export function ThemeProvider({ children }) {
  const saved = useCallback(() => {
    return loadJSON(STORAGE_KEYS.THEME, { tema: 'default', modo: 'dark', familia: 'clasico', variante: null })
  }, [])

  const [theme, setThemeState] = useState(() => saved())

  useEffect(() => {
    applyTheme(theme.tema, theme.modo, theme.familia, theme.variante)
    saveJSON(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const setTema = useCallback((tema) => {
    setThemeState(prev => ({ ...prev, tema }))
  }, [])

  const setFamilia = useCallback((familia) => {
    const fam = FAMILIAS.find(f => f.key === familia)
    const primeraVariante = fam?.variantes?.[0]?.key || null
    setThemeState(prev => ({ ...prev, familia, variante: primeraVariante }))
  }, [])

  const setVariante = useCallback((variante) => {
    setThemeState(prev => ({ ...prev, variante }))
  }, [])

  const toggleModo = useCallback(() => {
    setThemeState(prev => ({ ...prev, modo: prev.modo === 'dark' ? 'light' : 'dark' }))
  }, [])

  const temasDisponibles = Object.entries(TEMAS).map(([key, t]) => ({
    key,
    name: t.name,
    icon: t.icon
  }))

  const familias = FAMILIAS

  const iconContext = useMemo(() => ({
    familia: theme.familia || 'clasico',
    variante: theme.variante || null
  }), [theme.familia, theme.variante])

  return (
    <ThemeContext.Provider value={{
      theme, setTema, setFamilia, setVariante, toggleModo,
      temasDisponibles, familias, iconContext
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function useIconContext() {
  const { iconContext } = useTheme()
  return iconContext
}

export function useEstilo() {
  const { theme } = useTheme()
  return theme.familia || 'clasico'
}
