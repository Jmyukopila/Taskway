/* Service worker: avisa cuando SAVIO trae entregas nuevas y, a petición,
   abre Taskway y le inyecta el .ics para que lo importe. */

const NOTIF_ID = 'savio-nuevas'

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'savio-sincronizado') {
    if (msg.nuevas > 0) {
      chrome.notifications.create(NOTIF_ID, {
        type: 'basic',
        iconUrl: 'icons/128.png',
        title: 'SAVIO',
        message: `${msg.nuevas} ${msg.nuevas === 1 ? 'entrega nueva' : 'entregas nuevas'}. Toca para importarlas en Taskway.`,
        priority: 1
      })
    }
    return
  }
  if (msg?.type === 'importar') {
    importarEnTaskway().then(sendResponse)
    return true // respuesta asíncrona
  }
})

chrome.notifications.onClicked.addListener((id) => {
  if (id === NOTIF_ID) {
    chrome.notifications.clear(id)
    importarEnTaskway()
  }
})

async function importarEnTaskway() {
  const { taskwayUrl } = await chrome.storage.sync.get(['taskwayUrl'])
  const { savioIcs } = await chrome.storage.local.get(['savioIcs'])
  if (!taskwayUrl) return { ok: false, error: 'Falta la URL de Taskway (ábrela en Opciones).' }
  if (!savioIcs) return { ok: false, error: 'Todavía no se ha sincronizado SAVIO. Abre savio.utb.edu.co.' }

  let patron
  try {
    patron = new URL(taskwayUrl).origin + '/*'
  } catch {
    return { ok: false, error: 'La URL de Taskway no es válida.' }
  }

  const permitido = await chrome.permissions.contains({ origins: [patron] })
  if (!permitido) return { ok: false, error: 'Falta el permiso para Taskway. Concédelo en Opciones.' }

  const tab = await chrome.tabs.create({ url: taskwayUrl, active: true })
  await esperarCarga(tab.id)
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (payload) => {
      try {
        localStorage.setItem('taskway-savio-ics', JSON.stringify(payload))
        location.reload()
      } catch (e) {
        console.error('Taskway·SAVIO: no se pudo escribir', e)
      }
    },
    args: [savioIcs]
  })
  await chrome.storage.local.set({ savioPendientes: 0 })
  return { ok: true }
}

function esperarCarga(tabId) {
  return new Promise((resolve) => {
    const t = setTimeout(cerrar, 20000)
    function cerrar() {
      clearTimeout(t)
      chrome.tabs.onUpdated.removeListener(onUpdated)
      resolve()
    }
    function onUpdated(id, info) {
      if (id === tabId && info.status === 'complete') cerrar()
    }
    chrome.tabs.onUpdated.addListener(onUpdated)
  })
}
