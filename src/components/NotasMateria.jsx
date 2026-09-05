import { useMemo, useState } from 'react'
import NotaItemModal from './NotaItemModal'
import { resumenMateria, validarPeso } from '../lib/notas'
import { ChevronRightIcon, PlusIcon, EditIcon, TrashIcon } from '../config/icons'
import { formatFechaCorta } from '../lib/dates'

const fmt = (n) => n == null ? '—' : n.toLocaleString('es', { maximumFractionDigits: 2 })

export default function NotasMateria({ clase, materia, tasks, acciones }) {
  const claseId = clase.id
  const [abierto, setAbierto] = useState(false)
  const [modal, setModal] = useState(null) // { corteId, item? }

  const resumen = useMemo(
    () => resumenMateria(materia, tasks, claseId),
    [materia, tasks, claseId]
  )
  const { cortes, pesoTotal, definitivaProyectada, definitivaActual, notasTareas } = resumen
  const pesoDescuadrado = cortes.length > 0 && Math.abs(pesoTotal - 100) > 0.01

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <button
        onClick={() => setAbierto(v => !v)}
        aria-expanded={abierto}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <span className="w-1.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: clase.color }} />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{clase.materia}</span>
          <span className="block text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {cortes.length === 0 ? 'Sin cortes' : `${cortes.length} ${cortes.length === 1 ? 'corte' : 'cortes'}`}
            {notasTareas.items.length > 0 && ` · ${notasTareas.items.length} de tareas`}
          </span>
        </span>
        <span className="text-right flex-shrink-0">
          <span className="block text-lg font-bold leading-none" style={{ color: 'var(--color-text)' }}>{fmt(definitivaProyectada)}</span>
          <span className="block text-[10px]" style={{ color: 'var(--color-muted)' }}>proyectada</span>
        </span>
        <ChevronRightIcon className={`w-4 h-4 transition-transform flex-shrink-0 ${abierto ? 'rotate-90' : ''}`} style={{ color: 'var(--color-muted)' }} />
      </button>

      {abierto && (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {cortes.length === 0 ? (
            <div className="pt-3 space-y-2">
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Define los cortes de la materia para llevar sus notas.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => acciones.usarPlantilla(claseId)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: 'var(--color-teal)' }}
                >
                  Plantilla 30 / 30 / 40
                </button>
                <button
                  onClick={() => acciones.addCorte(claseId)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Añadir corte
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="pt-3 space-y-2">
                {cortes.map(corte => (
                  <CorteBloque
                    key={corte.id}
                    corte={corte}
                    onNombre={(nombre) => acciones.updateCorte(claseId, corte.id, { nombre })}
                    onPeso={(peso) => acciones.updateCorte(claseId, corte.id, { peso })}
                    onEliminar={() => acciones.deleteCorte(claseId, corte.id)}
                    onNuevoItem={() => setModal({ corteId: corte.id })}
                    onEditarItem={(item) => setModal({ corteId: corte.id, item })}
                    onEliminarItem={(itemId) => acciones.deleteItem(claseId, corte.id, itemId)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => acciones.addCorte(claseId)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Corte
                </button>
                <span className="text-[11px]" style={{ color: pesoDescuadrado ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                  Pesos: {fmt(pesoTotal)}%{pesoDescuadrado ? ' (deberían sumar 100)' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span style={{ color: 'var(--color-text-secondary)' }}>Definitiva al día de hoy</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{fmt(definitivaActual)}</span>
              </div>
            </>
          )}

          <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Notas de tareas</h4>
              {notasTareas.promedio != null && (
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Prom. {fmt(notasTareas.promedio)}</span>
              )}
            </div>
            {notasTareas.items.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sin tareas calificadas en esta materia todavía.</p>
            ) : (
              <ul className="space-y-1">
                {notasTareas.items.map(t => (
                  <li key={t.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text)' }}>
                    <span className="flex-1 min-w-0 truncate">{t.nombre}</span>
                    {t.fecha && <span className="font-mono text-[10px]" style={{ color: 'var(--color-muted)' }}>{formatFechaCorta(t.fecha)}</span>}
                    <span className="font-mono">{fmt(t.nota)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
              Vienen de tus tareas con nota. No entran en el cálculo de los cortes.
            </p>
          </div>
        </div>
      )}

      {modal && (
        <NotaItemModal
          item={modal.item}
          corteNombre={cortes.find(c => c.id === modal.corteId)?.nombre}
          onClose={() => setModal(null)}
          onGuardar={(datos) => {
            if (modal.item) acciones.updateItem(claseId, modal.corteId, modal.item.id, datos)
            else acciones.addItem(claseId, modal.corteId, datos)
          }}
        />
      )}
    </div>
  )
}

function CorteBloque({ corte, onNombre, onPeso, onEliminar, onNuevoItem, onEditarItem, onEliminarItem }) {
  const [nombre, setNombre] = useState(corte.nombre)
  const [peso, setPeso] = useState(String(corte.peso))

  const commitNombre = () => {
    const limpio = nombre.trim() || corte.nombre
    setNombre(limpio)
    if (limpio !== corte.nombre) onNombre(limpio)
  }

  const commitPeso = () => {
    try {
      const valor = validarPeso(peso)
      setPeso(String(valor))
      if (valor !== corte.peso) onPeso(valor)
    } catch {
      setPeso(String(corte.peso))
    }
  }

  return (
    <div className="rounded-lg border p-2.5 space-y-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-fondo)' }}>
      <div className="flex items-center gap-2">
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onBlur={commitNombre}
          aria-label="Nombre del corte"
          className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            value={peso}
            onChange={e => setPeso(e.target.value)}
            onBlur={commitPeso}
            inputMode="decimal"
            aria-label={`Peso del corte ${corte.nombre}`}
            className="w-12 text-right bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-secondary)' }}
          />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>%</span>
        </div>
        <span className="text-sm font-bold w-9 text-right flex-shrink-0" style={{ color: 'var(--color-text)' }}>{fmt(corte.nota)}</span>
        <button onClick={onEliminar} className="p-1 flex-shrink-0" style={{ color: 'var(--color-muted)' }} aria-label={`Eliminar corte ${corte.nombre}`}>
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {(corte.items || []).length > 0 && (
        <ul className="space-y-1">
          {corte.items.map(item => (
            <li key={item.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text)' }}>
              <span className="flex-1 min-w-0 truncate">{item.nombre}</span>
              <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{item.peso}%</span>
              <span className="font-mono w-8 text-right">{item.nota == null ? '—' : fmt(item.nota)}</span>
              <button onClick={() => onEditarItem(item)} className="p-1" style={{ color: 'var(--color-muted)' }} aria-label={`Editar ${item.nombre}`}>
                <EditIcon className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onEliminarItem(item.id)} className="p-1" style={{ color: 'var(--color-muted)' }} aria-label={`Eliminar ${item.nombre}`}>
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onNuevoItem}
        className="flex items-center gap-1 text-[11px] font-medium"
        style={{ color: 'var(--color-teal)' }}
      >
        <PlusIcon className="w-3 h-3" />
        Nota
      </button>
    </div>
  )
}
