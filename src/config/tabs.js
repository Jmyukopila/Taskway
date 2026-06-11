import { HoyIcon, HoyIconActive, CalendarioIcon, CalendarioIconActive, HabitosIcon, HabitosIconActive, HorarioIcon, HorarioIconActive, TareasIcon, TareasIconActive, DashboardIcon, DashboardIconActive } from './icons'

export const TABS = [
  { key: 'today', label: 'Hoy', icon: HoyIcon, iconActive: HoyIconActive },
  { key: 'calendar', label: 'Calendario', icon: CalendarioIcon, iconActive: CalendarioIconActive },
  { key: 'habits', label: 'Hábitos', icon: HabitosIcon, iconActive: HabitosIconActive },
  { key: 'schedule', label: 'Horario', icon: HorarioIcon, iconActive: HorarioIconActive },
  { key: 'tasks', label: 'Tareas', icon: TareasIcon, iconActive: TareasIconActive },
  { key: 'dashboard', label: 'Resumen', icon: DashboardIcon, iconActive: DashboardIconActive }
]
