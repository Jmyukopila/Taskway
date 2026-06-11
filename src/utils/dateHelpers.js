const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function getToday() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export function getDayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return DIAS[d.getDay()]
}

export function getDayNameIndex(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDay()
}

export function getWeekDays() {
  return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
}

export function getTodayDayName() {
  return DIAS[new Date().getDay()]
}

export function formatHour(h) {
  if (!h) return ''
  const [hh, mm] = h.split(':')
  return `${hh}:${mm}`
}

export function getCurrentTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function isToday(dateStr) {
  return dateStr === getToday()
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function compareTime(a, b) {
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}

export function getCurrentHour() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:00`
}
