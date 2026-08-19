import { hoy, sumarDias } from './dates'

const LIMITE_DIAS = 3650

/**
 * Dias consecutivos hasta hoy. La racha sigue viva si se marco hoy o ayer: a
 * primera hora de la manana todavia no hay nada hecho y romperla ahi seria
 * falso. `tieneFecha` recibe una fecha YYYY-MM-DD y responde si hubo actividad.
 */
export function calcularRacha(tieneFecha) {
  const today = hoy()
  const ayer = sumarDias(today, -1)

  let cursor = tieneFecha(today) ? today : tieneFecha(ayer) ? ayer : null
  if (!cursor) return 0

  let dias = 0
  while (tieneFecha(cursor) && dias < LIMITE_DIAS) {
    dias++
    cursor = sumarDias(cursor, -1)
  }
  return dias
}
