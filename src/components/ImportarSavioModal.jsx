import { useMemo, useRef, useState } from 'react'
import Modal from './ui/Modal'
import { STORAGE_KEYS } from '../config/constants'
import { loadJSON, saveJSON } from '../lib/storage'
import { nombresMaterias } from '../lib/materias'
import { construirImportacion, diffImportacion } from '../lib/savioImport'
import { formatFecha } from '../lib/dates'
import { permisoConcedido, enviarNotificacion } from '../utils/pushNotifications'
import { UploadIcon, ChevronRightIcon } from '../config/icons'

const RE_URL = /^https?:\/\/[^\s]+calendar\/export_execute\.php\?[^\s]+$/i

export default function ImportarSavioModal({ tasks, classes, onImport, onClose }) {
  const materias = useMemo(() => nombresMaterias(classes), [classes])
  const fileRef = useRef(null)

  const [url, setUrl] = useState(() => loadJSON(STORAGE_KEYS.SAVIO_URL, ''))
  const [analisis, setAnalisis] = useState(null) // { drafts, total, ignorados }
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState(null) // { creadas, actualizadas }

  const plan = useMemo(
    () => (analisis ? diffImportacion(tasks, analisis.drafts) : null),
    [analisis, tasks]
  )

  const guardarUrl = (valor) => {
    setUrl(valor)
    if (!valor.trim() || RE_URL.test(valor.trim())) saveJSON(STORAGE_KEYS.SAVIO_URL, valor.trim())
  }

  const abrirSavio = () => {
    if (RE_URL.test(url.trim())) window.open(url.trim(), '_blank', 'noopener')
  }

  const elegirArchivo = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setHecho(null)
    try {
      const texto = await file.text()
      const res = construirImportacion(texto, materias)
      if (res.total === 0) {
        setError('Ese archivo no parece un calendario de SAVIO (.ics).')
        setAnalisis(null)
        return
      }
      setAnalisis(res)
    } catch {
      setError('No se pudo leer el archivo.')
      setAnalisis(null)
    }
  }

  const confirmar = () => {
    if (!plan || (!plan.nuevas.length && !plan.cambios.length)) return
    onImport(analisis.drafts)
    const resumen = { creadas: plan.nuevas.length, actualizadas: plan.cambios.length }
    setHecho(resumen)
    if (resumen.creadas > 0 && permisoConcedido()) {
      enviarNotificacion(
        'Taskway',
        `${resumen.creadas} ${resumen.creadas === 1 ? 'tarea nueva' : 'tareas nuevas'} de SAVIO`,
        'savio-import'
      )
    }
  }

  return (
    <Modal open={true} onClose={onClose} titulo="Importar de SAVIO">
      {hecho ? (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            {hecho.creadas > 0 && <>Se agregaron <strong>{hecho.creadas}</strong> {hecho.creadas === 1 ? 'tarea' : 'tareas'}. </>}
            {hecho.actualizadas > 0 && <>Se actualizó la fecha de <strong>{hecho.actualizadas}</strong>. </>}
            {hecho.creadas === 0 && hecho.actualizadas === 0 && 'Sin cambios.'}
          </p>
          <button
            onClick={onClose}
            className="w-full text-white font-medium py-2.5 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--color-teal)' }}
          >
            Listo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ol className="text-xs space-y-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            <li>1. En el navegador, abre tu calendario de SAVIO (Calendario → Exportar → Exportar). Se descarga un archivo <code>.ics</code>.</li>
            <li>2. Vuelve aquí y elígelo. Taskway crea solo las tareas que aún no tienes.</li>
          </ol>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Enlace de tu calendario (opcional, se guarda en este dispositivo)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => guardarUrl(e.target.value)}
                placeholder="https://savio.utb.edu.co/calendar/export_execute.php?..."
                className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
              <button
                onClick={abrirSavio}
                disabled={!RE_URL.test(url.trim())}
                className="text-xs font-medium px-3 py-2 rounded-lg border flex-shrink-0 disabled:opacity-40"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Abrir
              </button>
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>
              El enlace lleva una clave: guárdalo solo en tu equipo y recréalo en SAVIO si lo compartes.
            </p>
          </div>

          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-teal)' }}
            >
              <UploadIcon className="w-4 h-4" />
              Elegir archivo .ics
            </button>
            <input ref={fileRef} type="file" accept=".ics,text/calendar" onChange={elegirArchivo} className="hidden" />
          </div>

          {error && <p role="alert" className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}

          {plan && (
            <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-fondo)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text)' }}>
                <strong>{plan.nuevas.length}</strong> nuevas · <strong>{plan.cambios.length}</strong> con fecha nueva · {plan.sinCambios} ya las tienes
                {analisis.ignorados > 0 && ` · ${analisis.ignorados} sin fecha`}
              </p>
              {plan.nuevas.length > 0 && (
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {plan.nuevas.map(d => (
                    <li key={d.origenId} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <ChevronRightIcon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-muted)' }} />
                      <span className="flex-1 min-w-0 truncate">{d.titulo}{d.materia && ` · ${d.materia}`}</span>
                      <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--color-muted)' }}>{formatFecha(d.fecha)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {plan.cambios.length > 0 && (
                <ul className="space-y-1">
                  {plan.cambios.map(c => (
                    <li key={c.id} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {c.titulo}: {formatFecha(c.de.fecha)} → <strong style={{ color: 'var(--color-text)' }}>{formatFecha(c.a.fecha)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={confirmar}
                disabled={!plan.nuevas.length && !plan.cambios.length}
                className="w-full text-white font-medium py-2 rounded-lg text-sm disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-teal)' }}
              >
                {plan.nuevas.length || plan.cambios.length
                  ? `Importar ${plan.nuevas.length + plan.cambios.length}`
                  : 'Nada que importar'}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
