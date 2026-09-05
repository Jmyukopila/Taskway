/* Content script: corre en cualquier página de savio.utb.edu.co.
   Aprovecha que el usuario ya pasó el Cloudflare y tiene sesión: descarga el
   .ics del calendario y lo deja guardado para que Taskway lo importe. */

(async () => {
  let cfg
  try {
    cfg = await chrome.storage.sync.get(['savioUrl'])
  } catch {
    return
  }
  if (!cfg.savioUrl) return

  // No martillear en cada navegación: como mucho una vez cada 30 min.
  const { savioLastSync = 0 } = await chrome.storage.local.get(['savioLastSync'])
  if (Date.now() - savioLastSync < 30 * 60 * 1000) return

  let texto
  try {
    const res = await fetch(cfg.savioUrl, { credentials: 'include' })
    if (!res.ok) return
    texto = await res.text()
  } catch {
    return // reto de Cloudflare o red: se reintenta en la próxima visita
  }
  if (!texto.includes('BEGIN:VEVENT')) return

  const uids = [...texto.matchAll(/^UID:(.+)$/gm)].map(m => m[1].trim())
  const { savioSeenUids = [] } = await chrome.storage.local.get(['savioSeenUids'])
  const vistas = new Set(savioSeenUids)
  const nuevas = uids.filter(u => !vistas.has(u))

  await chrome.storage.local.set({
    savioIcs: { text: texto, fetchedAt: Date.now() },
    savioSeenUids: uids,
    savioLastSync: Date.now(),
    savioPendientes: nuevas.length
  })

  chrome.runtime.sendMessage({ type: 'savio-sincronizado', nuevas: nuevas.length }).catch(() => {})
})()
