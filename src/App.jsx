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
import { GearIcon } from './config/icons'
import SettingsView from './views/SettingsView'
import UpdatePrompt from './components/UpdatePrompt'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  const [vista, setVista] = useState('today')
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { tasks, addTask, toggleTask, deleteTask, toggleSubtask, updateTask, alarmEnabled, setAlarmEnabled } = useTasks()
  const { classes, addClass, deleteClass, updateClass } = useClasses()
  const { habits, addHabit, toggleHabit, deleteHabit, updateHabit } = useHabits()
  const { events, addEvent, deleteEvent } = useEvents()

  const handleToggleTask = useCallback((id) => toggleTask(id), [toggleTask])

  const tareasHoy = useMemo(
    () => tasks.filter(t => t.fecha === new Date().toISOString().split('T')[0]),
    [tasks]
  )

  const tareasPendientesHoy = useMemo(
    () => tareasHoy.filter(t => !t.completada),
    [tareasHoy]
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
    <div className="flex flex-col min-h-dvh bg-fondo">
      {/* Header con selector de tema */}
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
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl transition-all active:scale-90"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
            title="Configuracion"
          >
            <GearIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Update / Install prompts */}
      <UpdatePrompt />
      <InstallPrompt />

      {/* Vista activa */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderVista()}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={vista} onTabChange={setVista} />

      {/* Pomodoro Modal */}
      {pomodoroOpen && (
        <PomodoroTimer
          onClose={() => setPomodoroOpen(false)}
          tareasPendientes={tareasPendientesHoy}
          onToggle={handleToggleTask}
        />
      )}

      {/* Settings View */}
      {settingsOpen && (
        <SettingsView onClose={() => setSettingsOpen(false)} alarmEnabled={alarmEnabled} setAlarmEnabled={setAlarmEnabled} />
      )}
    </div>
  )
}
