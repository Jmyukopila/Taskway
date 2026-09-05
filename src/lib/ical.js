/* ==========================================================================
   Lector minimo de iCalendar (RFC 5545) para importar el calendario de un
   Moodle (SAVIO). Solo lo que necesitamos: los VEVENT con su fecha, titulo,
   curso y enlace. No cubre repeticiones (RRULE) ni zonas horarias arbitrarias.
   ========================================================================== */

/** Deshace el "plegado" de lineas: una linea que empieza por espacio o tab
    continua la anterior. */
function desplegar(texto) {
  return texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '')
}

/** Desescapa un valor TEXT de iCalendar (\\n \\, \\; \\\\). */
function desescapar(valor) {
  return valor
    .replace(/\\n/gi, '\n')
    .replace(/\\([,;\\])/g, '$1')
}

/** Quita etiquetas HTML y decodifica las entidades mas comunes. */
function limpiarHtml(valor) {
  return valor
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function dosDigitos(n) {
  return String(n).padStart(2, '0')
}

/**
 * Interpreta el valor de un DTSTART/DTEND.
 *  - "YYYYMMDD" o VALUE=DATE  -> dia completo (sin hora)
 *  - "...THHMMSSZ"            -> UTC, se pasa a hora local
 *  - "...THHMMSS" (con TZID o sin nada) -> se toma como hora de pared local
 *    (correcto para quien esta en la misma zona que el Moodle).
 */
function parsearFecha(valor, params) {
  const bruto = valor.trim()
  const soloDia = params.VALUE === 'DATE' || /^\d{8}$/.test(bruto)
  const m = bruto.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/)
  if (!m) return null
  const [, y, mo, d, hh, mm, ss, z] = m

  if (soloDia || hh === undefined) {
    return { ymd: `${y}-${mo}-${d}`, hm: null, diaCompleto: true }
  }
  if (z) {
    const dt = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm, +(ss || 0)))
    return {
      ymd: `${dt.getFullYear()}-${dosDigitos(dt.getMonth() + 1)}-${dosDigitos(dt.getDate())}`,
      hm: `${dosDigitos(dt.getHours())}:${dosDigitos(dt.getMinutes())}`,
      diaCompleto: false
    }
  }
  return { ymd: `${y}-${mo}-${d}`, hm: `${hh}:${mm}`, diaCompleto: false }
}

function parsearLinea(linea) {
  const idx = linea.indexOf(':')
  if (idx === -1) return null
  const izquierda = linea.slice(0, idx)
  const valor = linea.slice(idx + 1)
  const partes = izquierda.split(';')
  const nombre = partes[0].toUpperCase()
  const params = {}
  for (let i = 1; i < partes.length; i++) {
    const [k, v] = partes[i].split('=')
    if (k) params[k.toUpperCase()] = (v || '').replace(/^"|"$/g, '')
  }
  return { nombre, params, valor }
}

/**
 * Devuelve los eventos del texto iCalendar:
 *   { uid, titulo, descripcion, url, categorias: [], inicio: { ymd, hm, diaCompleto } }
 */
export function parseICS(texto) {
  if (typeof texto !== 'string' || !texto.includes('BEGIN:VEVENT')) return []
  const lineas = desplegar(texto).split('\n')
  const eventos = []
  let actual = null

  for (const linea of lineas) {
    const t = linea.trim()
    if (t === 'BEGIN:VEVENT') { actual = { categorias: [] }; continue }
    if (t === 'END:VEVENT') {
      if (actual) {
        eventos.push({
          uid: actual.uid || '',
          titulo: actual.titulo || '',
          descripcion: actual.descripcion || '',
          url: actual.url || '',
          categorias: actual.categorias,
          inicio: actual.inicio || null
        })
      }
      actual = null
      continue
    }
    if (!actual) continue

    const p = parsearLinea(linea)
    if (!p) continue
    switch (p.nombre) {
      case 'UID':
        actual.uid = p.valor.trim()
        break
      case 'SUMMARY':
        actual.titulo = desescapar(p.valor).trim()
        break
      case 'DESCRIPTION': {
        const crudo = desescapar(p.valor)
        if (!actual.url) {
          const href = crudo.match(/href=["']?(https?:\/\/[^"'\s>]+)/i)
          const suelto = crudo.match(/https?:\/\/[^\s"'<>]+/)
          if (href) actual.url = href[1]
          else if (suelto) actual.url = suelto[0]
        }
        actual.descripcion = limpiarHtml(crudo)
        break
      }
      case 'URL':
        if (p.valor.trim()) actual.url = p.valor.trim()
        break
      case 'CATEGORIES':
        actual.categorias.push(
          ...p.valor.split(/(?<!\\),/).map(c => desescapar(c).trim()).filter(Boolean)
        )
        break
      case 'DTSTART':
        actual.inicio = parsearFecha(p.valor, p.params)
        break
      default:
        break
    }
  }
  return eventos
}
