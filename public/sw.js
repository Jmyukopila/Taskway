importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')

workbox.setConfig({ debug: false })

workbox.core.skipWaiting()
workbox.core.clientsClaim()

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [])

workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
)

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
)

workbox.routing.registerRoute(
  /\.(?:js|css|html|svg|png|webp|ico)$/,
  new workbox.strategies.StaleWhileRevalidate()
)

function notificarClients() {
  clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    list.forEach(c => c.postMessage({ type: 'play-alarm' }))
  })
}

// === NOTIFICACIONES PUSH ===
self.addEventListener('push', (event) => {
  let data = { title: 'Taskway', body: 'Tienes una tarea pendiente', tag: 'taskway-default' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Taskway', {
      body: data.body || 'Tienes una tarea pendiente',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'taskway-default',
      requireInteraction: true,
      vibrate: [400, 200, 400, 200, 800]
    }).then(notificarClients)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        clientList[0].focus()
      } else if (clients.openWindow) {
        clients.openWindow('/')
      }
    })
  )
})

// === MENSAJES DESDE LA APP ===
self.addEventListener('message', (event) => {
  if (!event.data) return
  const { type, title, body, tag, delay } = event.data
  if (type === 'show-notification') {
    self.registration.showNotification(title || 'Taskway', {
      body: body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: tag || 'taskway-default',
      requireInteraction: true,
      vibrate: [400, 200, 400, 200, 800]
    }).then(notificarClients)
  }
  if (type === 'schedule-notification' && delay) {
    const timeoutId = setTimeout(() => {
      self.registration.showNotification(title || 'Taskway', {
        body: body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: tag || 'taskway-default',
        requireInteraction: true,
        vibrate: [400, 200, 400, 200, 800]
      }).then(notificarClients)
    }, delay)
    self.__scheduledNotifs = self.__scheduledNotifs || new Map()
    self.__scheduledNotifs.set(tag || 'taskway-default', timeoutId)
  }
})
