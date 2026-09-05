import { useState, useMemo } from 'react'
import { mesNombre, diasEnMes, primerDiaMes, hoy, esHoy, formatFecha } from '../lib/dates'
import AddEventModal from '../components/AddEventModal'
import AddTaskModal from '../components/AddTaskModal'
import TaskAcademicInfo from '../components/TaskAcademicInfo'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, CheckIcon, PlusIcon, EditIcon } from '../config/icons'

const DIAS_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function CalendarView({ tasks, classes, events, onToggle, onAddEvent, onDeleteEvent, onUpdateTask }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventDate, setEventDate] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (!map[t.fecha]) map[t.fecha] = []
      map[t.fecha].push(t)
    })
    return map
  }, [tasks])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => {
      if (!map[ev.fecha]) map[ev.fecha] = []
      map[ev.fecha].push(ev)
    })
    return map
  }, [events])

  const dias = useMemo(() => {
    const total = diasEnMes(year, month)
    const primero = primerDiaMes(year, month).getDay()
    const celdas = []
    for (let i = 0; i < primero; i++) celdas.push(null)
    for (let d = 1; d <= total; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      celdas.push(dateStr)
    }
    return celdas
  }, [year, month])

  const tareasDelDia = useMemo(() => {
    if (!diaSeleccionado) return []
    return tasksByDate[diaSeleccionado] || []
  }, [diaSeleccionado, tasksByDate])

  const eventosDelDia = useMemo(() => {
    if (!diaSeleccionado) return []
    return eventsByDate[diaSeleccionado] || []
  }, [diaSeleccionado, eventsByDate])

  const hoyStr = hoy()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setDiaSeleccionado(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setDiaSeleccionado(null)
  }

  const handleDayClick = (dateStr) => {
    setDiaSeleccionado(prev => prev === dateStr ? null : dateStr)
  }

  const getClasesDelDia = (dateStr) => {
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const d = new Date(dateStr + 'T12:00:00')
    const diaNombre = dayNames[d.getDay()]
    return classes.filter(c => c.diasSemana.includes(diaNombre))
  }

  return (
    <div className="calendar-view flex-1 px-4 pt-4 pb-8 overflow-y-auto">
      <section className="calendar-sheet mb-4 animate-fade-in-up" aria-label="Calendario mensual">
        {/* Header del mes */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="calendar-arrow" aria-label="Mes anterior">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold" aria-live="polite">
            {mesNombre(month)} {year}
          </h2>
          <button onClick={nextMonth} className="calendar-arrow" aria-label="Mes siguiente">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="calendar-weekdays grid grid-cols-7 mb-2">
          {DIAS_LABEL.map(d => (
            <div key={d} className="text-center text-[11px] font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grilla del mes */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dias.map((dateStr, i) => {
            if (!dateStr) return <div key={`empty-${i}`} />
            const num = Number(dateStr.split('-')[2])
            const tasksCount = (tasksByDate[dateStr] || []).length
            const evCount = (eventsByDate[dateStr] || []).length
            const classesHoy = getClasesDelDia(dateStr)
            const classesCount = classesHoy.length
            const selected = diaSeleccionado === dateStr
            const today = dateStr === hoyStr

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                aria-label={`${formatFecha(dateStr)}${today ? ', hoy' : ''}${tasksCount ? `, ${tasksCount} tareas` : ''}${classesCount ? `, ${classesCount} clases` : ''}${evCount ? `, ${evCount} eventos` : ''}`}
                aria-pressed={selected}
                aria-current={today ? 'date' : undefined}
                className="calendar-day relative flex flex-col items-center justify-center text-sm"
              >
                <span className="text-sm font-medium">{num}</span>
                <span className="calendar-markers flex gap-1 mt-1" aria-hidden="true">
                  {tasksCount > 0 && <span className="calendar-marker calendar-marker-task" />}
                  {classesCount > 0 && <span className="calendar-marker calendar-marker-class" />}
                  {evCount > 0 && <span className="calendar-marker calendar-marker-event" />}
                </span>
              </button>
            )
          })}
        </div>
        <div className="calendar-legend flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
          <span><i className="calendar-marker calendar-marker-task" aria-hidden="true" />Tareas</span>
          <span><i className="calendar-marker calendar-marker-class" aria-hidden="true" />Clases</span>
          <span><i className="calendar-marker calendar-marker-event" aria-hidden="true" />Eventos</span>
        </div>
      </section>

      {/* Detalle del día seleccionado */}
      {diaSeleccionado && (
        <div className="calendar-details animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ui-calendar-muted)' }}>
              {formatFecha(diaSeleccionado)}
              {esHoy(diaSeleccionado) && <span className="ml-2 text-teal">(Hoy)</span>}
            </h3>
            <button
              onClick={() => { setEventDate(diaSeleccionado); setShowEventModal(true) }}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 transition-all active:scale-95"
              style={{ backgroundColor: 'var(--ui-calendar-event)', color: 'var(--ui-on-event)', borderRadius: 'var(--ui-control-radius)' }}
            >
              <PlusIcon className="w-3 h-3" />
              Evento
            </button>
          </div>

          {/* Eventos del día */}
          {eventosDelDia.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ui-calendar-event)' }}>Eventos</h4>
              <div className="space-y-2">
                {eventosDelDia.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--ui-calendar-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || 'var(--ui-calendar-event)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--ui-calendar-text)' }}>{ev.titulo}</p>
                      {ev.descripcion && <p className="text-xs" style={{ color: 'var(--ui-calendar-muted)' }}>{ev.descripcion}</p>}
                      {ev.recordatorioDias && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--ui-calendar-muted)' }}>
                          Recordatorio: {ev.recordatorioDias === 1 ? '1 día antes' : ev.recordatorioDias === 7 ? '1 semana antes' : `${ev.recordatorioDias} días antes`}
                        </p>
                      )}
                    </div>
                    <button onClick={() => onDeleteEvent(ev.id)} className="p-1 transition-colors" style={{ color: 'var(--ui-calendar-muted)' }} aria-label={`Eliminar evento ${ev.titulo}`}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tareas del día */}
          {tareasDelDia.length === 0 && eventosDelDia.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--ui-calendar-muted)' }}>Sin tareas ni eventos este día</p>
          )}

          {tareasDelDia.length > 0 && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ui-calendar-muted)' }}>Tareas</h4>
              <div className="space-y-2">
                {tareasDelDia.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: 'var(--ui-calendar-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <button
                      onClick={() => onToggle(t.id)}
                      role="checkbox"
                      aria-checked={!!t.completada}
                      aria-label={t.titulo}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: t.completada ? 'var(--ui-calendar-selected)' : 'transparent',
                        borderColor: t.completada ? 'var(--ui-calendar-accent)' : 'var(--ui-calendar-muted)'
                      }}
                    >
                      {t.completada && <CheckIcon className="w-3 h-3" style={{ color: 'var(--ui-on-accent)' }} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm break-words ${t.completada ? 'line-through' : ''}`} style={{ color: 'var(--ui-calendar-text)' }}>
                        {t.titulo}
                      </p>
                      <TaskAcademicInfo tarea={t} classes={classes} />
                      {t.hora && <span className="text-[11px] font-mono" style={{ color: 'var(--ui-calendar-muted)' }}>{t.hora}</span>}
                    </div>
                    <button onClick={() => setEditingTask(t)} className="p-2 shrink-0" style={{ color: 'var(--ui-icon)' }} aria-label={`Editar tarea ${t.titulo}`}>
                      <EditIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Clases del día */}
          {getClasesDelDia(diaSeleccionado).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ui-calendar-muted)' }}>Clases</h4>
              <div className="space-y-2">
                {getClasesDelDia(diaSeleccionado).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--ui-calendar-surface)', borderColor: 'var(--color-border)' }}>
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--ui-calendar-text)' }}>{c.materia}</p>
                      <p className="text-xs" style={{ color: 'var(--ui-calendar-muted)' }}>
                        {c.horaInicio} - {c.horaFin}{c.salon && ` · ${c.salon}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editingTask && (
        <AddTaskModal
          task={editingTask}
          classes={classes}
          onClose={() => setEditingTask(null)}
          onAdd={data => { onUpdateTask(editingTask.id, data); setEditingTask(null) }}
        />
      )}

      {/* Modal de nuevo evento */}
      {showEventModal && (
        <AddEventModal
          onClose={() => setShowEventModal(false)}
          onAdd={onAddEvent}
          fecha={eventDate}
        />
      )}
    </div>
  )
}
