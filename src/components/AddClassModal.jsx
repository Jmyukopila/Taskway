import { useState } from 'react'
import { DIAS_SEMANA, COLORES_CLASE } from '../config/constants'
import Modal from './ui/Modal'

const DIAS = DIAS_SEMANA
const COLORES = COLORES_CLASE

export default function AddClassModal({ onClose, onAdd }) {
  const [materia, setMateria] = useState('')
  const [profesor, setProfesor] = useState('')
  const [salon, setSalon] = useState('')
  const [horaInicio, setHoraInicio] = useState('07:00')
  const [horaFin, setHoraFin] = useState('08:00')
  const [color, setColor] = useState(COLORES[0])
  const [diasSemana, setDiasSemana] = useState([])

  const toggleDia = (dia) => {
    setDiasSemana(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!materia.trim() || diasSemana.length === 0) return
    onAdd({
      tipo: 'clase',
      materia: materia.trim(),
      profesor: profesor.trim(),
      salon: salon.trim(),
      horaInicio, horaFin, color, diasSemana
    })
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} titulo="Nueva clase">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Materia</label>
          <input type="text" value={materia} onChange={e => setMateria(e.target.value)}
            placeholder="Nombre de la materia" autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Profesor</label>
            <input type="text" value={profesor} onChange={e => setProfesor(e.target.value)}
              placeholder="Nombre"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Salón</label>
            <input type="text" value={salon} onChange={e => setSalon(e.target.value)}
              placeholder="Aula"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Inicio</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Fin</label>
            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Días</label>
          <div className="flex gap-1.5">
            {DIAS.map(dia => (
              <button key={dia} type="button" onClick={() => toggleDia(dia)}
                className="flex-1 text-[11px] font-medium py-2 rounded-lg border capitalize transition-all"
                style={{
                  backgroundColor: diasSemana.includes(dia) ? 'var(--color-teal)' : 'var(--color-fondo)',
                  color: diasSemana.includes(dia) ? '#fff' : 'var(--color-text)',
                  borderColor: diasSemana.includes(dia) ? 'var(--color-teal)' : 'var(--color-border)'
                }}>
                {dia.slice(0, 3)}
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

        <button type="submit" disabled={!materia.trim() || diasSemana.length === 0}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-teal)' }}>
          Crear clase
        </button>
      </form>
    </Modal>
  )
}
