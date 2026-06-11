/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  const android = /android/.test(ua)
  const ios = /iphone|ipad|ipod/.test(ua) || (navigator.maxTouchPoints > 0 && /mac/.test(ua))
  return { android, ios }
}

const PWAContext = createContext()

export function PWAProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)
  const [manualGuide, setManualGuide] = useState(false)

  const platform = useMemo(() => detectPlatform(), [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const mq = window.matchMedia('(display-mode: standalone)')
    const onStandalone = (e) => setIsInstalled(e.matches)
    onStandalone(mq)
    mq.addEventListener('change', onStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mq.removeEventListener('change', onStandalone)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing
          if (newSW) {
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
                setUpdateSW(() => () => {
                  newSW.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                })
              }
            })
          }
        })
      })
    }
  }, [])

  useEffect(() => {
    if (!platform.android || isInstalled || installPrompt) return
    const timer = setTimeout(() => setManualGuide(true), 10000)
    return () => clearTimeout(timer)
  }, [platform.android, isInstalled, installPrompt])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      setManualGuide(true)
      return
    }
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }, [installPrompt])

  const dismissInstall = useCallback(() => {
    setInstallPrompt(null)
  }, [])

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false)
  }, [])

  const dismissManualGuide = useCallback(() => {
    setManualGuide(false)
  }, [])

  const value = useMemo(() => ({
    installPrompt,
    isInstalled,
    updateAvailable,
    platform,
    manualGuide,
    handleInstall,
    dismissInstall,
    handleUpdate: updateSW,
    dismissUpdate,
    dismissManualGuide
  }), [installPrompt, isInstalled, updateAvailable, platform, manualGuide, handleInstall, dismissInstall, updateSW, dismissUpdate, dismissManualGuide])

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  return useContext(PWAContext)
}
