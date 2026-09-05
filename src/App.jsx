import { useState, useMemo, useCallback } from 'react'

import useTasks from './hooks/useTasks'
import useClasses from './hooks/useClasses'
import useHabits from './hooks/useHabits'
import useEvents from './hooks/useEvents'
import useNotas from './hooks/useNotas'
import BottomNav from './components/BottomNav'
import TodayView from './views/TodayView'
import CalendarView from './views/CalendarView'
import HabitsView from './views/HabitsView'
import ScheduleView from './views/ScheduleView'
import TasksView from './views/TasksView'
import AcademicoView from './views/AcademicoView'
import PomodoroTimer from './components/PomodoroTimer'
import { GearIcon, ClockIcon } from './config/icons'
import SettingsView from './views/SettingsView'
import UpdatePrompt from './components/UpdatePrompt'
import InstallPrompt from './components/InstallPrompt'
import NovedadesModal from './components/NovedadesModal'
import useNovedades from './hooks/useNovedades'
import { hoy } from './lib/dates'
import { normalizarMateria } from './lib/materias'

export default function App() {
  const [vista, setVista] = useState('today')
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { tasks, addTask, toggleTask, deleteTask, toggleSubtask, updateTask, renombrarMateria: renombrarMateriaTareas, desvincularClase, importarSavio, alarmEnabled, setAlarmEnabled } = useTasks()
  const { classes, addClass, deleteClass, updateClass } = useClasses()
  const { habits, addHabit, toggleHabit, deleteHabit, updateHabit } = useHabits()
  const { events, addEvent, deleteEvent } = useEvents()
  const notas = useNotas()
  const novedades = useNovedades()

  const { renombrarMateria: renombrarMateriaNotas, eliminarMateria: eliminarMateriaNotas } = notas

  // El area Academico razona por materia (nombre), no por sesion de clase. Al
  // editar el horario hay que arrastrar notas y tareas: renombrar una clase que
  // es la unica de su materia renombra todo; borrar la ultima clase de una
  // materia se lleva sus notas y desvincula sus tareas (que conservan el nombre).
  const handleUpdateClass = useCallback((id, cambios) => {
    const anterior = classes.find(c => c.id === id)
    updateClass(id, cambios)
    if (!anterior || !Object.hasOwn(cambios, 'materia')) return
    const viejo = normalizarMateria(anterior.materia)
    const nuevo = normalizarMateria(cambios.materia)
    if (!nuevo || viejo === nuevo) return
    const quedanOtras = classes.some(c => c.id !== id && normalizarMateria(c.materia) === viejo)
    if (!quedanOtras) {
      renombrarMateriaNotas(viejo, nuevo)
      renombrarMateriaTareas(viejo, nuevo)
    }
  }, [classes, updateClass, renombrarMateriaNotas, renombrarMateriaTareas])

  const handleDeleteClass = useCallback((id) => {
    const clase = classes.find(c => c.id === id)
    deleteClass(id)
    if (!clase) return
    const nombre = normalizarMateria(clase.materia)
    const quedanOtras = classes.some(c => c.id !== id && normalizarMateria(c.materia) === nombre)
    if (!quedanOtras) {
      eliminarMateriaNotas(nombre)
      desvincularClase(id)
    }
  }, [classes, deleteClass, eliminarMateriaNotas, desvincularClase])

  const handleToggleTask = useCallback((id) => toggleTask(id), [toggleTask])

  const tareasPendientesHoy = useMemo(
    () => tasks.filter(t => t.fecha === hoy() && !t.completada),
    [tasks]
  )

  const renderVista = () => {
    switch (vista) {
      case 'today':
        return <TodayView tasks={tasks} classes={classes} onToggle={handleToggleTask} onDeleteTask={deleteTask} toggleSubtask={toggleSubtask} onOpenPomodoro={() => setPomodoroOpen(true)} onUpdateTask={updateTask} />
      case 'calendar':
        return <CalendarView tasks={tasks} classes={classes} events={events} onToggle={handleToggleTask} onAddEvent={addEvent} onDeleteEvent={deleteEvent} onUpdateTask={updateTask} />
      case 'habits':
        return <HabitsView habits={habits} onAdd={addHabit} onToggle={toggleHabit} onDelete={deleteHabit} onUpdateHabit={updateHabit} />
      case 'schedule':
        return <ScheduleView classes={classes} onAddClass={addClass} onDeleteClass={handleDeleteClass} onUpdateClass={handleUpdateClass} />
      case 'academico':
        return <AcademicoView tasks={tasks} habits={habits} classes={classes} notas={notas} onAddClass={addClass} onAddTask={addTask} onToggle={handleToggleTask} onDeleteTask={deleteTask} toggleSubtask={toggleSubtask} onUpdateTask={updateTask} />
      case 'tasks':
        return <TasksView tasks={tasks} classes={classes} onAddTask={addTask} onToggle={handleToggleTask} onDeleteTask={deleteTask} toggleSubtask={toggleSubtask} onUpdateTask={updateTask} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          backgroundColor: 'var(--color-fondo)',
          borderColor: 'var(--color-border)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)'
        }}
      >
        <h1 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
          Taskway
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPomodoroOpen(true)}
            className="p-2 rounded-xl transition-all active:scale-90"
            style={{ backgroundColor: 'var(--ui-calendar-surface)', color: 'var(--ui-icon)', borderRadius: 'var(--ui-control-radius)' }}
            title="Pomodoro"
            aria-label="Abrir temporizador Pomodoro"
          >
            <ClockIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl transition-all active:scale-90"
            style={{ backgroundColor: 'var(--ui-calendar-surface)', color: 'var(--ui-icon-muted)', borderRadius: 'var(--ui-control-radius)' }}
            title="Configuracion"
            aria-label="Abrir configuracion"
          >
            <GearIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <UpdatePrompt />
      <InstallPrompt />

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderVista()}
      </main>

      <BottomNav activeTab={vista} onTabChange={setVista} />

      {pomodoroOpen && (
        <PomodoroTimer
          onClose={() => setPomodoroOpen(false)}
          tareasPendientes={tareasPendientesHoy}
          onToggle={handleToggleTask}
        />
      )}

      {settingsOpen && (
        <SettingsView
          onClose={() => setSettingsOpen(false)}
          alarmEnabled={alarmEnabled}
          setAlarmEnabled={setAlarmEnabled}
          onVerNovedades={novedades.abrirHistorial}
          version={novedades.version}
          escapeInhibido={novedades.abierto}
          tasks={tasks}
          classes={classes}
          onImportSavio={importarSavio}
        />
      )}

      {novedades.abierto && (
        <NovedadesModal entradas={novedades.entradas} onClose={novedades.cerrar} />
      )}
    </div>
  )
}
