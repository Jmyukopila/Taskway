const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/**
 * Fecha local en formato YYYY-MM-DD.
 * No usar toISOString(): convierte a UTC y en husos negativos adelanta el dia
 * por la tarde (una tarea creada "hoy" a las 19:00 caeria en manana).
 */
export function aFecha(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function hoy() {
  return aFecha()
}

/** Suma dias a una fecha YYYY-MM-DD y devuelve otra fecha YYYY-MM-DD. */
export function sumarDias(dateStr, dias) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return aFecha(d)
}

export function diaSemana(dateStr) {
  return DIAS[new Date(dateStr + 'T12:00:00').getDay()]
}

export function diaSemanaIndex(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDay()
}

export function diasSemana() {
  return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
}

export function hoyNombre() {
  return DIAS[new Date().getDay()]
}

export function esHoy(dateStr) {
  return dateStr === hoy()
}

export function formatFecha(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function formatFechaCorta(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function compararHora(a, b) {
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}

export function ahora() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function primerDiaMes(year, month) {
  return new Date(year, month, 1)
}

export function ultimoDiaMes(year, month) {
  return new Date(year, month + 1, 0)
}

export function diasEnMes(year, month) {
  return ultimoDiaMes(year, month).getDate()
}

export function mesNombre(month) {
  return MESES[month]
}

export function yearMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function fromKey(key) {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function generarProximaFechaRecurrente(fecha, recurrencia) {
  if (!recurrencia) return null
  const d = new Date(fecha + 'T12:00:00')

  switch (recurrencia.tipo) {
    case 'diaria':
      d.setDate(d.getDate() + (recurrencia.intervalo || 1))
      break
    case 'semanal': {
      let diasAvanzar = 1
      const diasSemanaNum = recurrencia.diasSemana?.map(dia => DIAS.indexOf(dia)).filter(n => n >= 0) || []
      if (diasSemanaNum.length > 0) {
        for (let i = 1; i <= 7; i++) {
          const nextDay = (d.getDay() + i) % 7
          if (diasSemanaNum.includes(nextDay)) {
            diasAvanzar = i
            break
          }
        }
      } else {
        diasAvanzar = 7 * (recurrencia.intervalo || 1)
      }
      d.setDate(d.getDate() + diasAvanzar)
      break
    }
    case 'mensual':
      d.setMonth(d.getMonth() + (recurrencia.intervalo || 1))
      break
    default:
      return null
  }

  return aFecha(d)
}

export function semanaKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const inicio = new Date(d)
  inicio.setDate(d.getDate() - d.getDay())
  return aFecha(inicio)
}

export function fechaLocal(dateStr) {
  return dateStr
}
