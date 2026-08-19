import { useState, useMemo, useCallback } from 'react'

import useTasks from './hooks/useTasks'
import useClasses from './hooks/useClasses'
import useHabits from './hooks/useHabits'
import useEvents from './hooks/useEvents'
import BottomNav from './components/BottomNav'
import TodayView from './views/TodayView'
import CalendarView from './views/CalendarView'
import HabitsView from './views/HabitsView'
import ScheduleView from './views/ScheduleView'
import TasksView from './views/TasksView'
import DashboardView from './views/DashboardView'
import PomodoroTimer from './components/PomodoroTimer'
import { GearIcon, ClockIcon } from './config/icons'
import SettingsView from './views/SettingsView'
import UpdatePrompt from './components/UpdatePrompt'
import InstallPrompt from './components/InstallPrompt'
import { hoy } from './lib/dates'

export default function App() {
  const [vista, setVista] = useState('today')
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { tasks, addTask, toggleTask, deleteTask, toggleSubtask, updateTask, alarmEnabled, setAlarmEnabled } = useTasks()
  const { classes, addClass, deleteClass, updateClass } = useClasses()
  const { habits, addHabit, toggleHabit, deleteHabit, updateHabit } = useHabits()
  const { events, addEvent, deleteEvent } = useEvents()

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
        return <CalendarView tasks={tasks} classes={classes} events={events} onToggle={handleToggleTask} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
      case 'habits':
        return <HabitsView habits={habits} onAdd={addHabit} onToggle={toggleHabit} onDelete={deleteHabit} onUpdateHabit={updateHabit} />
      case 'schedule':
        return <ScheduleView classes={classes} onAddClass={addClass} onDeleteClass={deleteClass} onUpdateClass={updateClass} />
      case 'dashboard':
        return <DashboardView tasks={tasks} habits={habits} />
      case 'tasks':
        return <TasksView tasks={tasks} onAddTask={addTask} onToggle={handleToggleTask} onDeleteTask={deleteTask} toggleSubtask={toggleSubtask} onUpdateTask={updateTask} />
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
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-teal)' }}
            title="Pomodoro"
            aria-label="Abrir temporizador Pomodoro"
          >
            <ClockIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl transition-all active:scale-90"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
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
        <SettingsView onClose={() => setSettingsOpen(false)} alarmEnabled={alarmEnabled} setAlarmEnabled={setAlarmEnabled} />
      )}
    </div>
  )
}
