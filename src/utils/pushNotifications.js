// Push notifications - phase 3 implementation
// This file will replace the setTimeout-based notifications
// Currently the app uses basic setTimeout notifications in useTasks hook

export async function pedirPermiso() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function enviarNotificacion(titulo, cuerpo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(titulo, { body: cuerpo, requireInteraction: true })
}

// Future: Replace setTimeout with Push API + VAPID
// 1. Generate VAPID keys
// 2. Subscribe with navigator.serviceWorker.ready.pushManager.subscribe()
// 3. Send subscription to server (or store locally)
// 4. Service worker listens for 'push' events
// 5. Show notification from service worker
