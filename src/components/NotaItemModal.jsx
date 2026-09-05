import { useId, useRef, useState } from 'react'
import Modal from './ui/Modal'
import { validarNota, validarPeso } from '../lib/notas'

/** Alta y edicion de un item de nota (parcial, quiz, taller...) dentro de un corte. */
export default function NotaItemModal({ onClose, onGuardar, item, corteNombre }) {
  const esEdicion = !!item
  const nombreId = useId()
  const notaId = useId()
  const pesoId = useId()

  const [nombre, setNombre] = useState(item?.nombre || '')
  const [notaInput, setNotaInput] = useState(
    item?.nota == null ? '' : String(item.nota).replace('.', ',')
  )
  const [pesoInput, setPesoInput] = useState(
    item?.peso == null ? '' : String(item.peso).replace('.', ',')
  )
  const [error, setError] = useState('')
  const notaRef = useRef(null)
  const pesoRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    let nota
    try {
      nota = validarNota(notaInput)
    } catch (err) {
      setError(err.message)
      notaRef.current?.focus()
      return
    }

    let peso
    try {
      peso = validarPeso(pesoInput === '' ? 100 : pesoInput)
    } catch (err) {
      setError(err.message)
      pesoRef.current?.focus()
      return
    }

    onGuardar({ nombre: nombre.trim(), nota, peso })
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} titulo={esEdicion ? 'Editar nota' : `Nueva nota${corteNombre ? ` · ${corteNombre}` : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={nombreId} className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nombre</label>
          <input
            id={nombreId}
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Parcial, quiz, taller..."
            autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor={notaId} className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nota (0-5)</label>
            <input
              id={notaId}
              ref={notaRef}
              type="text"
              inputMode="decimal"
              value={notaInput}
              onChange={e => { setNotaInput(e.target.value); if (error) setError('') }}
              placeholder="Ej: 4,2"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: error ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex-1">
            <label htmlFor={pesoId} className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Peso en el corte (%)</label>
            <input
              id={pesoId}
              ref={pesoRef}
              type="text"
              inputMode="decimal"
              value={pesoInput}
              onChange={e => { setPesoInput(e.target.value); if (error) setError('') }}
              placeholder="100"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: error ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Deja la nota vacia si aun no la tienes: el item cuenta cuando la anotes. Si no pones peso, vale 100%.
        </p>

        {error && <p role="alert" className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={!nombre.trim()}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-teal)' }}
        >
          {esEdicion ? 'Guardar cambios' : 'Agregar nota'}
        </button>
      </form>
    </Modal>
  )
}
