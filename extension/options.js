const $savio = document.getElementById('savio')
const $taskway = document.getElementById('taskway')
const $estado = document.getElementById('estado')

function msg(texto, error) {
  $estado.textContent = texto
  $estado.style.color = error ? '#d33' : '#1D9E75'
}

function patronOrigen(url) {
  try {
    return new URL(url).origin + '/*'
  } catch {
    return null
  }
}

chrome.storage.sync.get(['savioUrl', 'taskwayUrl']).then(cfg => {
  $savio.value = cfg.savioUrl || ''
  $taskway.value = cfg.taskwayUrl || ''
})

document.getElementById('guardar').addEventListener('click', async () => {
  const savioUrl = $savio.value.trim()
  const taskwayUrl = $taskway.value.trim()
  if (savioUrl && !/^https:\/\/savio\.utb\.edu\.co\/calendar\/export_execute\.php\?/.test(savioUrl)) {
    return msg('La URL de SAVIO no tiene la forma esperada (calendar/export_execute.php).', true)
  }
  if (taskwayUrl && !patronOrigen(taskwayUrl)) {
    return msg('La URL de Taskway no es válida.', true)
  }
  await chrome.storage.sync.set({ savioUrl, taskwayUrl })
  await chrome.storage.local.remove(['savioLastSync', 'savioSeenUids'])
  msg('Guardado. Abre savio.utb.edu.co para la primera sincronización.')
})

document.getElementById('permiso').addEventListener('click', async () => {
  const patron = patronOrigen($taskway.value.trim())
  if (!patron) return msg('Primero escribe una URL de Taskway válida.', true)
  try {
    const ok = await chrome.permissions.request({ origins: [patron] })
    msg(ok ? `Permiso concedido para ${patron}.` : 'Permiso rechazado.', !ok)
  } catch (e) {
    msg('No se pudo pedir el permiso: ' + e.message, true)
  }
})
