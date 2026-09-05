import { useId, useRef, useState } from 'react'
import { hoy, diasSemana } from '../lib/dates'
import Modal from './ui/Modal'
import { uid } from '../lib/id'
import { normalizarCalificacion } from '../lib/academico'
import { nombresMaterias, normalizarMateria } from '../lib/materias'
import { PlusIcon, RecurringIcon, CloseIcon } from '../config/icons'

const DIAS = diasSemana()

export default function AddTaskModal({ onClose, onAdd, task, classes = [], materiaInicial = '' }) {
  const esEdicion = !!task
  const materiaId = useId()
  const calificacionId = useId()
  const calificacionTipId = useId()
  const [titulo, setTitulo] = useState(task?.titulo || '')
  const [descripcion, setDescripcion] = useState(task?.descripcion || '')
  const [fecha, setFecha] = useState(task?.fecha || hoy())
  const [hora, setHora] = useState(task?.hora || '')
  const [prioridad, setPrioridad] = useState(task?.prioridad || 'media')
  const [showHora, setShowHora] = useState(!!task?.hora)
  const [showRecurrencia, setShowRecurrencia] = useState(!!task?.recurrencia)
  const [recurTipo, setRecurTipo] = useState(task?.recurrencia?.tipo || 'diaria')
  const [recurDias, setRecurDias] = useState(task?.recurrencia?.diasSemana || [])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [subtasks, setSubtasks] = useState(task?.subtasks || [])
  const materiasHorario = nombresMaterias(classes)
  const [materia, setMateria] = useState(() =>
    normalizarMateria(esEdicion ? task?.materia : (task?.materia || materiaInicial))
  )
  const materiaFuera = !!materia && !materiasHorario.includes(materia)
  const [calificacionInput, setCalificacionInput] = useState(
    task?.calificacion === null || task?.calificacion === undefined ? '' : String(task.calificacion).replace('.', ',')
  )
  const [calificacionError, setCalificacionError] = useState('')
  const calificacionRef = useRef(null)

  const toggleRecurDia = (dia) => {
    setRecurDias(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const addSubtask = () => {
    if (!subtaskInput.trim()) return
    setSubtasks(prev => [...prev, { id: uid(), titulo: subtaskInput.trim(), completada: false }])
    setSubtaskInput('')
  }

  const removeSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    let calificacion
    try {
      calificacion = normalizarCalificacion(calificacionInput)
    } catch (err) {
      setCalificacionError(err.message)
      calificacionRef.current?.focus()
      return
    }

    const recurrencia = showRecurrencia ? {
      tipo: recurTipo,
      intervalo: 1,
      diasSemana: recurTipo === 'semanal' ? recurDias : undefined
    } : null

    onAdd({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fecha,
      hora: showHora && hora ? hora : null,
      prioridad,
      subtasks,
      recurrencia,
      materia,
      calificacion
    })
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} titulo={esEdicion ? 'Editar tarea' : 'Nueva tarea'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Titulo</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Que tienes que hacer?"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Descripcion</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalles adicionales..." rows={2}
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Prioridad</label>
            <select value={prioridad} onChange={e => setPrioridad(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="min-w-0">
            <label htmlFor={materiaId} className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Materia</label>
            <select id={materiaId} value={materia} onChange={e => setMateria(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="">Sin materia</option>
              {materiasHorario.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              {materiaFuera && <option value={materia}>{materia} (fuera del horario)</option>}
            </select>
            {materiasHorario.length === 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Agrega tus materias en Horario para poder seleccionarlas.
              </p>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor={calificacionId} className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nota (0-5)</label>
            <input
              id={calificacionId}
              ref={calificacionRef}
              type="text"
              inputMode="decimal"
              value={calificacionInput}
              onChange={e => { setCalificacionInput(e.target.value); if (calificacionError) setCalificacionError('') }}
              placeholder="Ej: 4,5"
              aria-describedby={calificacionTipId}
              aria-invalid={!!calificacionError}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: calificacionError ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }}
            />
            <p id={calificacionTipId} className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Deja vacío si aún no recibes la nota.
            </p>
            {calificacionError && (
              <p role="alert" className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{calificacionError}</p>
            )}
          </div>
        </div>

        {/* Subtareas */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Subtareas</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
              placeholder="Agregar subtarea..."
              className="flex-1 rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <button type="button" onClick={addSubtask}
              className="px-3 py-2 rounded-lg text-white flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-teal)' }}
              aria-label="Agregar subtarea">
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          {subtasks.map(s => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <span className="text-xs flex-1" style={{ color: 'var(--color-text)' }}>{s.titulo}</span>
              <button type="button" onClick={() => removeSubtask(s.id)} className="p-1" style={{ color: 'var(--color-muted)' }} aria-label={`Quitar ${s.titulo}`}>
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Hora */}
        <div>
          <button type="button" onClick={() => setShowHora(!showHora)}
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: showHora ? 'var(--color-danger)' : 'var(--color-teal)' }}>
            <PlusIcon className={`w-4 h-4 transition-transform ${showHora ? 'rotate-45' : ''}`} />
            {showHora ? 'Quitar hora' : 'Agregar hora'}
          </button>
          {showHora && (
            <input type="time" value={hora} onChange={e => setHora(e.target.value)}
              className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          )}
        </div>

        {/* Recurrencia */}
        <div>
          <button type="button" onClick={() => setShowRecurrencia(!showRecurrencia)}
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: showRecurrencia ? 'var(--color-danger)' : 'var(--color-teal)' }}>
            <RecurringIcon className="w-4 h-4" />
            {showRecurrencia ? 'Quitar recurrencia' : 'Tarea recurrente'}
          </button>
          {showRecurrencia && (
            <div className="mt-2 space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-fondo)' }}>
              <div className="flex gap-2">
                {['diaria', 'semanal', 'mensual'].map(t => (
                  <button key={t} type="button" onClick={() => setRecurTipo(t)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg capitalize transition-all`}
                    style={{
                      backgroundColor: recurTipo === t ? 'var(--color-teal)' : 'transparent',
                      color: recurTipo === t ? '#fff' : 'var(--color-text)',
                      border: `1px solid ${recurTipo === t ? 'var(--color-teal)' : 'var(--color-border)'}`
                    }}>
                    {t}
                  </button>
                ))}
              </div>
              {recurTipo === 'semanal' && (
                <div className="flex gap-1">
                  {DIAS.map(d => (
                    <button key={d} type="button" onClick={() => toggleRecurDia(d)}
                      className="flex-1 text-[10px] font-medium py-1.5 rounded-lg capitalize transition-all"
                      style={{
                        backgroundColor: recurDias.includes(d) ? 'var(--color-teal)' : 'transparent',
                        color: recurDias.includes(d) ? '#fff' : 'var(--color-text)',
                        border: `1px solid ${recurDias.includes(d) ? 'var(--color-teal)' : 'var(--color-border)'}`
                      }}>
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={!titulo.trim()}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-teal)' }}>
          {esEdicion ? 'Guardar cambios' : 'Crear tarea'}
        </button>
      </form>
    </Modal>
  )
}
