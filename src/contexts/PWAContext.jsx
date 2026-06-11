/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const PWAContext = createContext()

export function PWAProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)

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

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
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

  return (
    <PWAContext.Provider value={{
      installPrompt,
      isInstalled,
      updateAvailable,
      handleInstall,
      dismissInstall,
      handleUpdate: updateSW,
      dismissUpdate
    }}>
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  return useContext(PWAContext)
}
