import { useState } from 'react'
import Modal from './ui/Modal'

const OPCIONES_RECORDATORIO = [
  { value: null, label: 'No avisar' },
  { value: 1, label: '1 día antes' },
  { value: 3, label: '3 días antes' },
  { value: 7, label: '1 semana antes' },
  { value: 14, label: '2 semanas antes' }
]

const COLORES = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

export default function AddEventModal({ onClose, onAdd, fecha }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [recordatorioDias, setRecordatorioDias] = useState(null)
  const [color, setColor] = useState(COLORES[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    onAdd({ titulo: titulo.trim(), descripcion: descripcion.trim(), fecha, recordatorioDias, color })
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} titulo="Nuevo evento especial">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Título</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Nombre del evento" autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalles del evento..." rows={2}
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Recordatorio</label>
          <div className="space-y-1.5">
            {OPCIONES_RECORDATORIO.map(op => (
              <button key={op.label} type="button" onClick={() => setRecordatorioDias(op.value)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: recordatorioDias === op.value ? 'color-mix(in srgb, var(--color-teal) 20%, transparent)' : 'var(--color-fondo)',
                  color: 'var(--color-text)',
                  border: `1px solid ${recordatorioDias === op.value ? 'var(--color-teal)' : 'var(--color-border)'}`
                }}>
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Color</label>
          <div className="flex gap-2">
            {COLORES.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                style={{ backgroundColor: c, '--tw-ring-color': '#fff', '--tw-ring-offset-color': 'var(--color-card)' }} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={!titulo.trim()}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-teal)' }}>
          Guardar evento
        </button>
      </form>
    </Modal>
  )
}
