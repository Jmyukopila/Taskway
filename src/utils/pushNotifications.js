const VAPID_PUBLIC_KEY = 'BLgWkKhcCfQq3uM59Jd2zlcBAZPDpnzA_gE8YfslyEuKk9pWvnv_jNqBJOiRlPEBciQekCHDo6-LsT4ZpO1SdeE'

export async function pedirPermiso() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function enviarNotificacion(titulo, cuerpo, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(titulo, { body: cuerpo, tag, requireInteraction: true })
}

export async function suscribirPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  if (Notification.permission !== 'granted') return null
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    return sub
  } catch {
    return null
  }
}

export async function getSubscription() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  } catch {
    return null
  }
}

export async function enviarNotificacionDesdeSW({ title, body, tag, delay }) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false
  try {
    navigator.serviceWorker.controller.postMessage({
      type: delay ? 'schedule-notification' : 'show-notification',
      title, body, tag, delay
    })
    return true
  } catch {
    return false
  }
}

let audioCtx = null

export function playAlarm() {
  if (localStorage.getItem('mi-dia-alarm-enabled') === 'false') return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioCtx.currentTime

    const gain = audioCtx.createGain()
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.8, now)

    const osc = audioCtx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, now)

    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.5
      osc.frequency.setValueAtTime(880, t)
      osc.frequency.setValueAtTime(660, t + 0.25)
    }

    gain.gain.exponentialRampToValueAtTime(0.01, now + 3)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 3)

    osc.onended = () => {
      if (!audioCtx) return
      audioCtx.close().then(() => { audioCtx = null }).catch(() => {})
    }
  } catch { /* audio no disponible */ }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}
