import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { cargarCatalogo, descargarPack, importarPackDesdeArchivo, exportarPack } from '../lib/packs'
import { CheckIcon, DownloadIcon, TrashIcon, UploadIcon, RecurringIcon, EmptyIcon } from '../config/icons'

/* ==========================================================================
   Tienda de paquetes de temas.

   El catalogo se sirve como archivo estatico desde /packs/, asi que la
   descarga es una peticion normal al mismo origen: sin backend, y el service
   worker la cachea para que el paquete siga disponible sin conexion.
   ========================================================================== */

export default function PackManager() {
  const { packs, packActivo, aplicarPack, quitarPack, agregarPack, borrarPack } = useTheme()

  const [catalogo, setCatalogo] = useState([])
  const [estadoCatalogo, setEstadoCatalogo] = useState('cargando')
  const [descargando, setDescargando] = useState(null)
  const [error, setError] = useState(null)
  const archivoRef = useRef(null)

  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    cargarCatalogo()
      .then(lista => {
        if (cancelado) return
        setCatalogo(lista)
        setEstadoCatalogo('listo')
      })
      .catch(() => { if (!cancelado) setEstadoCatalogo('error') })
    return () => { cancelado = true }
  }, [intento])

  const reintentarCatalogo = () => {
    setEstadoCatalogo('cargando')
    setIntento(n => n + 1)
  }

  const instalados = new Set(packs.map(p => p.id))

  const handleDescargar = async (id) => {
    setError(null)
    setDescargando(id)
    try {
      const pack = await descargarPack(id)
      agregarPack(pack)
      aplicarPack(pack.id)
    } catch (e) {
      setError(`No se pudo descargar: ${e.message}`)
    } finally {
      setDescargando(null)
    }
  }

  const handleImportar = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    importarPackDesdeArchivo(file)
      .then(pack => {
        agregarPack(pack)
        aplicarPack(pack.id)
      })
      .catch(err => setError(err.message))
  }

  const disponibles = catalogo.filter(c => !instalados.has(c.id))

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
        Paquetes de temas
      </h3>

      {error && (
        <p className="text-xs mb-2 px-3 py-2 rounded-lg"
          style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 12%, transparent)' }}>
          {error}
        </p>
      )}

      {/* Instalados */}
      {packs.length > 0 && (
        <div className="space-y-2 mb-3">
          {packs.map(pack => {
            const activo = packActivo?.id === pack.id
            return (
              <div key={pack.id} className="rounded-xl p-3 border"
                style={{
                  backgroundColor: 'var(--color-fondo)',
                  borderColor: activo ? 'var(--color-teal)' : 'var(--color-border)'
                }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 flex-shrink-0">
                    {['fondo', 'teal', 'purple', 'card'].map(clave => (
                      <span key={clave} className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: pack.colores?.dark?.[clave] || pack.colores?.light?.[clave] || 'transparent',
                          borderColor: 'var(--color-border)'
                        }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{pack.nombre}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--color-muted)' }}>{pack.descripcion}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => (activo ? quitarPack() : aplicarPack(pack.id))}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: activo ? 'var(--color-teal)' : 'color-mix(in srgb, var(--color-teal) 12%, transparent)',
                      color: activo ? '#fff' : 'var(--color-teal)'
                    }}
                    aria-pressed={activo}
                  >
                    {activo && <CheckIcon className="w-3.5 h-3.5" />}
                    {activo ? 'En uso' : 'Aplicar'}
                  </button>
                  <button
                    onClick={() => exportarPack(pack)}
                    className="px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                    style={{ color: 'var(--color-muted)', backgroundColor: 'var(--color-card)' }}
                    aria-label={`Exportar ${pack.nombre}`}
                    title="Exportar a un archivo"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => borrarPack(pack.id)}
                    className="px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                    style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                    aria-label={`Eliminar ${pack.nombre}`}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Catalogo */}
      {estadoCatalogo === 'cargando' && (
        <p className="text-xs px-1 py-2" style={{ color: 'var(--color-muted)' }}>Buscando paquetes...</p>
      )}

      {estadoCatalogo === 'error' && (
        <button
          onClick={reintentarCatalogo}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs transition-colors"
          style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <RecurringIcon className="w-4 h-4" />
          No se pudo cargar el catalogo. Reintentar
        </button>
      )}

      {estadoCatalogo === 'listo' && disponibles.length === 0 && packs.length > 0 && (
        <p className="text-xs px-1 py-2" style={{ color: 'var(--color-muted)' }}>
          Ya tienes todos los paquetes del catalogo.
        </p>
      )}

      {estadoCatalogo === 'listo' && disponibles.length === 0 && packs.length === 0 && (
        <div className="flex flex-col items-center py-6">
          <EmptyIcon className="w-8 h-8 mb-2" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No hay paquetes disponibles</p>
        </div>
      )}

      {disponibles.length > 0 && (
        <div className="space-y-2">
          {disponibles.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 border"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
              <div className="flex gap-1 flex-shrink-0">
                {item.muestra.map((c, i) => (
                  <span key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c, borderColor: 'var(--color-border)' }} />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.nombre}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--color-muted)' }}>{item.descripcion}</p>
              </div>
              <button
                onClick={() => handleDescargar(item.id)}
                disabled={descargando === item.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }}
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                {descargando === item.id ? 'Bajando' : 'Descargar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Importar archivo */}
      <button
        onClick={() => archivoRef.current?.click()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-sm mt-2"
        style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
      >
        <UploadIcon className="w-5 h-5" />
        <span>Importar paquete desde archivo</span>
      </button>
      <input ref={archivoRef} type="file" accept=".json,application/json" onChange={handleImportar} className="hidden" />
    </section>
  )
}
