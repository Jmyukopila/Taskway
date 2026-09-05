const $sync = document.getElementById('sync')
const $pend = document.getElementById('pend')
const $estado = document.getElementById('estado')

function hace(ts) {
  if (!ts) return 'nunca'
  const min = Math.round((Date.now() - ts) / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`
}

chrome.storage.local.get(['savioLastSync', 'savioPendientes']).then(s => {
  $sync.textContent = `Última sincronización: ${hace(s.savioLastSync)}`
  const n = s.savioPendientes || 0
  $pend.textContent = n > 0 ? `${n} ${n === 1 ? 'entrega nueva sin importar' : 'entregas nuevas sin importar'}` : 'Sin novedades pendientes.'
})

document.getElementById('importar').addEventListener('click', () => {
  $estado.textContent = 'Abriendo Taskway…'
  chrome.runtime.sendMessage({ type: 'importar' }, (r) => {
    $estado.textContent = r?.ok ? 'Listo, revísalo en Taskway.' : (r?.error || 'No se pudo.')
    $estado.style.color = r?.ok ? '#1D9E75' : '#d33'
  })
})

document.getElementById('opciones').addEventListener('click', () => chrome.runtime.openOptionsPage())
