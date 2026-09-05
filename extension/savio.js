/* Content script: corre en cualquier página de savio.utb.edu.co.
   Aprovecha que el usuario ya pasó el Cloudflare y tiene sesión: descarga el
   .ics del calendario y lo deja guardado para que Taskway lo importe. */

(async () => {
  const MIN = 60 * 1000
  let cfg
  try {
    cfg = await chrome.storage.sync.get(['savioUrl'])
  } catch {
    return
  }
  if (!cfg.savioUrl) return

  const st = await chrome.storage.local.get(['savioLastSync', 'savioLastAttempt', 'savioSeenUids'])
  const ahora = Date.now()
  // No martillear: 30 min entre sincronizaciones, 5 min entre reintentos fallidos.
  if (ahora - (st.savioLastSync || 0) < 30 * MIN) return
  if (ahora - (st.savioLastAttempt || 0) < 5 * MIN) return
  await chrome.storage.local.set({ savioLastAttempt: ahora })

  let res
  let texto
  try {
    res = await fetch(cfg.savioUrl, { credentials: 'include' })
    texto = await res.text()
  } catch {
    return // red o Cloudflare sin resolver: transitorio, se reintenta luego
  }

  // Cloudflare aún sin resolver en esta pestaña: no es culpa del enlace.
  if (/just a moment|challenge-platform|cf_chl/i.test(texto)) return

  if (!texto.includes('BEGIN:VEVENT')) {
    // Respuesta válida pero no es un calendario: el authtoken caducó o cambió.
    await chrome.storage.local.set({ savioError: { status: res.status, at: ahora } })
    chrome.runtime.sendMessage({ type: 'savio-error' }).catch(() => {})
    return
  }

  const uids = [...texto.matchAll(/^UID:(.+)$/gm)].map(m => m[1].trim())
  const vistas = new Set(st.savioSeenUids || [])
  const nuevas = uids.filter(u => !vistas.has(u))

  await chrome.storage.local.set({
    savioIcs: { text: texto, fetchedAt: ahora },
    savioSeenUids: uids,
    savioLastSync: ahora,
    savioPendientes: nuevas.length,
    savioError: null
  })

  chrome.runtime.sendMessage({ type: 'savio-sincronizado', nuevas: nuevas.length }).catch(() => {})
})()
