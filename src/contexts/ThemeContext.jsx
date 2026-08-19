/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { TEMAS } from '../config/themes'
import { FAMILIAS, getVariante } from '../config/estilos'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { listarInstalados, instalarPack, desinstalarPack } from '../lib/packs'
import { fondoACSS } from '../lib/fondos'

const ThemeContext = createContext()

const COLORES_ACENTO = new Set([
  'teal', 'teal-hover', 'purple', 'purple-hover', 'success', 'warning', 'danger'
])

function aplicarFondo(root, fondo) {
  const css = fondoACSS(fondo)
  root.style.setProperty('--fondo-imagen', css.imagen)
  root.style.setProperty('--fondo-tamano', css.tamano)
  root.style.setProperty('--fondo-posicion', css.posicion)
  root.style.setProperty('--fondo-repeticion', css.repeticion)
}

function applyTheme(temaKey, modo, familia, variante, pack) {
  const tema = TEMAS[temaKey] || TEMAS.default
  const root = document.documentElement
  const baseVars = tema[modo]

  if (baseVars) {
    Object.entries(baseVars).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val)
    })
  }

  if (pack) {
    // Un paquete es un tema completo: pisa la paleta base con lo que traiga y
    // aporta su propio fondo. Lo que no defina se hereda del tema de abajo.
    Object.entries(pack.colores?.[modo] || {}).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val)
    })
    aplicarFondo(root, pack.fondo?.[modo])
  } else {
    aplicarFondo(root, null)

    // Overrides de la variante: solo acentos. Fondo, borde, texto y muted los
    // define el tema porque dependen del modo claro/oscuro.
    if (familia && variante) {
      const v = getVariante(familia, variante)
      if (v?.colors) {
        Object.entries(v.colors)
          .filter(([key]) => COLORES_ACENTO.has(key))
          .forEach(([key, val]) => root.style.setProperty(`--color-${key}`, val))
      }
    }
  }

  const colorFondo = pack?.colores?.[modo]?.fondo || baseVars?.fondo || '#0f0f0f'
  root.setAttribute('data-theme', pack ? `pack-${pack.id}-${modo}` : `${temaKey}-${modo}`)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colorFondo)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => loadJSON(STORAGE_KEYS.THEME, { tema: 'default', modo: 'dark', familia: 'clasico', variante: null, pack: null })
  )
  const [packs, setPacks] = useState(() => listarInstalados())

  const packActivo = useMemo(
    () => packs.find(p => p.id === theme.pack) || null,
    [packs, theme.pack]
  )

  useEffect(() => {
    applyTheme(theme.tema, theme.modo, theme.familia, theme.variante, packActivo)
    saveJSON(STORAGE_KEYS.THEME, theme)
  }, [theme, packActivo])

  // Elegir tema o familia integrados significa volver al aspecto base.
  const setTema = useCallback((tema) => {
    setThemeState(prev => ({ ...prev, tema, pack: null }))
  }, [])

  const setFamilia = useCallback((familia) => {
    const fam = FAMILIAS.find(f => f.key === familia)
    const primeraVariante = fam?.variantes?.[0]?.key || null
    setThemeState(prev => ({ ...prev, familia, variante: primeraVariante, pack: null }))
  }, [])

  const setVariante = useCallback((variante) => {
    setThemeState(prev => ({ ...prev, variante, pack: null }))
  }, [])

  const toggleModo = useCallback(() => {
    setThemeState(prev => ({ ...prev, modo: prev.modo === 'dark' ? 'light' : 'dark' }))
  }, [])

  /* ---------------- paquetes ---------------- */

  const aplicarPack = useCallback((id) => {
    setThemeState(prev => ({ ...prev, pack: id }))
  }, [])

  const quitarPack = useCallback(() => {
    setThemeState(prev => ({ ...prev, pack: null }))
  }, [])

  const agregarPack = useCallback((pack) => {
    setPacks(instalarPack(pack))
    return pack
  }, [])

  const borrarPack = useCallback((id) => {
    setPacks(desinstalarPack(id))
    // Si estaba aplicado, se vuelve al tema base en vez de quedar sin colores.
    setThemeState(prev => (prev.pack === id ? { ...prev, pack: null } : prev))
  }, [])

  const temasDisponibles = useMemo(() => Object.entries(TEMAS).map(([key, t]) => ({
    key,
    name: t.name,
    icon: t.icon
  })), [])

  const iconContext = useMemo(() => ({
    familia: theme.familia || 'clasico',
    variante: theme.variante || null,
    pack: packActivo
  }), [theme.familia, theme.variante, packActivo])

  const value = useMemo(() => ({
    theme,
    setTema,
    setFamilia,
    setVariante,
    toggleModo,
    temasDisponibles,
    familias: FAMILIAS,
    iconContext,
    packs,
    packActivo,
    aplicarPack,
    quitarPack,
    agregarPack,
    borrarPack
  }), [theme, setTema, setFamilia, setVariante, toggleModo, temasDisponibles, iconContext, packs, packActivo, aplicarPack, quitarPack, agregarPack, borrarPack])

  return (
    <ThemeContext.Provider value={value}>
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
