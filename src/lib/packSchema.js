/* ==========================================================================
   Formato de los paquetes de temas (v1).

   Un paquete es JSON puro: se descarga del servidor o se importa desde un
   archivo, asi que se trata como dato NO confiable. Nada de lo que trae llega
   al DOM sin pasar por aqui: colores solo en hexadecimal, numeros acotados,
   tipos de capa de fondo de una lista cerrada y comandos de path limitados a
   M/L/C/Q/Z. Nunca se evalua codigo ni se inyectan cadenas CSS tal cual.

   Ejemplo minimo:
   {
     "id": "mecha",
     "formato": 1,
     "nombre": "Mecha",
     "descripcion": "Hangar, reactor y alertas ambar",
     "base": "acero",
     "svg": { "strokeWidth": 2.5, "strokeLinecap": "square", "strokeLinejoin": "miter" },
     "motivo": [ [["M",0,-1],["L",1,0],["L",0,1],["L",-1,0],["Z"]] ],
     "colores": { "dark": { "teal": "#38BDF8" }, "light": { "teal": "#0284C7" } },
     "fondo":   { "dark": { "capas": [...] }, "light": { "capas": [...] } }
   }
   ========================================================================== */

export const FORMATO_ACTUAL = 1

const RE_ID = /^[a-z0-9][a-z0-9-]{1,31}$/
const RE_HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const BASES = ['clasico', 'flora', 'acero']
const LINECAPS = ['butt', 'round', 'square']
const LINEJOINS = ['miter', 'round', 'bevel']
const MODOS = ['light', 'dark']

export const CLAVES_COLOR = [
  'fondo', 'card', 'card-hover', 'border', 'text', 'text-secondary', 'muted',
  'teal', 'teal-hover', 'purple', 'purple-hover', 'success', 'warning', 'danger'
]

export const TIPOS_CAPA = ['radial', 'lineal', 'puntos', 'rayas', 'rejilla', 'patron']

// "A" (arco eliptico) permite dibujar olas y petalos sin aproximarlos con
// curvas: rx, ry, rotacion, dos banderas 0/1 y el punto final.
const ARIDAD_COMANDO = { M: 2, L: 2, C: 6, Q: 4, A: 7, Z: 0 }
const INDICES_BANDERA = { A: [3, 4] }

const LIMITES_TEXTO = { id: 32, nombre: 40, descripcion: 120, autor: 40 }

class PackInvalido extends Error {}

function fallar(msg) {
  throw new PackInvalido(msg)
}

function texto(valor, campo, maximo) {
  if (typeof valor !== 'string') fallar(`"${campo}" debe ser texto`)
  const limpio = valor.trim()
  if (!limpio) fallar(`"${campo}" no puede estar vacio`)
  if (limpio.length > maximo) fallar(`"${campo}" supera ${maximo} caracteres`)
  return limpio
}

function color(valor, campo) {
  if (typeof valor !== 'string' || !RE_HEX.test(valor.trim())) {
    fallar(`"${campo}" debe ser un color hexadecimal (#rgb, #rrggbb o #rrggbbaa)`)
  }
  return valor.trim()
}

function numero(valor, campo, min, max) {
  const v = typeof valor === 'number' ? valor : NaN
  if (!Number.isFinite(v)) fallar(`"${campo}" debe ser un numero`)
  return Math.min(max, Math.max(min, v))
}

function opcion(valor, campo, permitidos) {
  if (!permitidos.includes(valor)) fallar(`"${campo}" debe ser uno de: ${permitidos.join(', ')}`)
  return valor
}

/* ---------------- motivo ---------------- */

function validarSubpath(sub, indice, campo, limites) {
  const { maxComandos, min, max } = limites
  if (!Array.isArray(sub) || sub.length === 0) fallar(`${campo}[${indice}] debe ser una lista de comandos`)
  if (sub.length > maxComandos) fallar(`${campo}[${indice}] tiene demasiados comandos (max ${maxComandos})`)

  const salida = sub.map((cmd, j) => {
    if (!Array.isArray(cmd) || typeof cmd[0] !== 'string') fallar(`${campo}[${indice}][${j}] debe ser ["M", x, y]`)
    const letra = cmd[0].toUpperCase()
    const aridad = ARIDAD_COMANDO[letra]
    if (aridad === undefined) fallar(`${campo}[${indice}][${j}]: comando "${cmd[0]}" no permitido (M, L, C, Q, A, Z)`)
    if (cmd.length - 1 !== aridad) fallar(`${campo}[${indice}][${j}]: "${letra}" espera ${aridad} numeros`)

    const banderas = INDICES_BANDERA[letra] || []
    const vals = cmd.slice(1).map((v, k) => {
      const ruta = `${campo}[${indice}][${j}][${k + 1}]`
      if (banderas.includes(k)) return numero(v, ruta, 0, 1) >= 0.5 ? 1 : 0
      if (letra === 'A' && k === 2) return numero(v, ruta, -360, 360)   // rotacion
      if (letra === 'A' && k < 2) return numero(v, ruta, 0, 4)          // radios
      return numero(v, ruta, min, max)
    })
    return [letra, ...vals]
  })

  if (salida[0][0] !== 'M') fallar(`${campo}[${indice}] debe empezar por "M"`)
  return salida
}

/**
 * El motivo se define en coordenadas unitarias alrededor del origen: al pintar
 * se escala por el radio y se traslada al punto focal de cada icono. Deben ser
 * formas CERRADAS y sin solaparse entre si, porque en los iconos rellenos se
 * restan del contorno con fill-rule evenodd (dos formas solapadas volverian a
 * rellenar el hueco).
 */
function validarMotivo(motivo) {
  if (!Array.isArray(motivo) || motivo.length === 0) fallar('"motivo" debe ser una lista de subpaths')
  if (motivo.length > 8) fallar('"motivo" admite como maximo 8 subpaths')
  return motivo.map((sub, i) => validarSubpath(sub, i, 'motivo', { maxComandos: 32, min: -2, max: 2 }))
}

/**
 * Forma de una capa "patron": se dibuja en una casilla de 0 a 1 que luego se
 * repite. Admite mas trazos que un motivo porque un patron tradicional
 * (seigaiha, asanoha) necesita varias piezas para encajar sin costuras.
 */
function validarForma(forma, ruta) {
  if (!Array.isArray(forma) || forma.length === 0) fallar(`"${ruta}" debe ser una lista de subpaths`)
  if (forma.length > 32) fallar(`"${ruta}" admite como maximo 32 subpaths`)
  return forma.map((sub, i) => validarSubpath(sub, i, ruta, { maxComandos: 64, min: -1, max: 2 }))
}

/* ---------------- colores ---------------- */

function validarPaleta(paleta, modo) {
  if (paleta === undefined) return {}
  if (typeof paleta !== 'object' || paleta === null) fallar(`"colores.${modo}" debe ser un objeto`)
  const salida = {}
  Object.entries(paleta).forEach(([clave, valor]) => {
    if (!CLAVES_COLOR.includes(clave)) return // clave desconocida: se ignora
    salida[clave] = color(valor, `colores.${modo}.${clave}`)
  })
  return salida
}

/* ---------------- fondo ---------------- */

function validarCapa(capa, ruta) {
  if (typeof capa !== 'object' || capa === null) fallar(`${ruta} debe ser un objeto`)
  const tipo = opcion(capa.tipo, `${ruta}.tipo`, TIPOS_CAPA)
  const base = { tipo, color: color(capa.color, `${ruta}.color`) }

  switch (tipo) {
    case 'radial':
      return {
        ...base,
        x: numero(capa.x ?? 50, `${ruta}.x`, -50, 150),
        y: numero(capa.y ?? 0, `${ruta}.y`, -50, 150),
        ancho: numero(capa.ancho ?? 80, `${ruta}.ancho`, 5, 200),
        alto: numero(capa.alto ?? 60, `${ruta}.alto`, 5, 200)
      }
    case 'lineal':
      return {
        ...base,
        color2: capa.color2 === undefined ? 'transparent' : color(capa.color2, `${ruta}.color2`),
        angulo: numero(capa.angulo ?? 180, `${ruta}.angulo`, 0, 360)
      }
    case 'puntos':
      return {
        ...base,
        radio: numero(capa.radio ?? 1.5, `${ruta}.radio`, 0.5, 8),
        paso: numero(capa.paso ?? 24, `${ruta}.paso`, 4, 200)
      }
    case 'rayas':
      return {
        ...base,
        grosor: numero(capa.grosor ?? 2, `${ruta}.grosor`, 0.5, 40),
        paso: numero(capa.paso ?? 14, `${ruta}.paso`, 2, 200),
        angulo: numero(capa.angulo ?? 45, `${ruta}.angulo`, 0, 360)
      }
    case 'rejilla':
      return {
        ...base,
        grosor: numero(capa.grosor ?? 1, `${ruta}.grosor`, 0.5, 20),
        paso: numero(capa.paso ?? 28, `${ruta}.paso`, 4, 200)
      }
    case 'patron':
      return {
        ...base,
        forma: validarForma(capa.forma, `${ruta}.forma`),
        paso: numero(capa.paso ?? 48, `${ruta}.paso`, 8, 400),
        alto: numero(capa.alto ?? 1, `${ruta}.alto`, 0.1, 4),   // proporcion de la casilla
        grosor: numero(capa.grosor ?? 2, `${ruta}.grosor`, 0, 20),
        relleno: capa.relleno === true
      }
    default:
      return base
  }
}

function validarFondo(fondo, modo) {
  if (fondo === undefined) return null
  if (typeof fondo !== 'object' || fondo === null) fallar(`"fondo.${modo}" debe ser un objeto`)
  const capas = fondo.capas
  if (!Array.isArray(capas) || capas.length === 0) fallar(`"fondo.${modo}.capas" debe ser una lista`)
  if (capas.length > 6) fallar(`"fondo.${modo}.capas" admite como maximo 6 capas`)
  return { capas: capas.map((c, i) => validarCapa(c, `fondo.${modo}.capas[${i}]`)) }
}

/* ---------------- pack completo ---------------- */

/**
 * Valida y normaliza un paquete. Devuelve { ok: true, pack } o
 * { ok: false, error } con un mensaje mostrable al usuario.
 */
export function validarPack(entrada) {
  try {
    if (typeof entrada !== 'object' || entrada === null) fallar('El archivo no contiene un paquete')

    const formato = numero(entrada.formato ?? 1, 'formato', 1, 99)
    if (formato > FORMATO_ACTUAL) {
      fallar('El paquete usa un formato mas nuevo: actualiza la app')
    }

    const id = texto(entrada.id, 'id', LIMITES_TEXTO.id).toLowerCase()
    if (!RE_ID.test(id)) fallar('"id" solo admite minusculas, numeros y guiones')

    const colores = typeof entrada.colores === 'object' && entrada.colores !== null ? entrada.colores : {}
    const fondos = typeof entrada.fondo === 'object' && entrada.fondo !== null ? entrada.fondo : {}

    const pack = {
      formato: FORMATO_ACTUAL,
      id,
      nombre: texto(entrada.nombre, 'nombre', LIMITES_TEXTO.nombre),
      descripcion: entrada.descripcion === undefined
        ? ''
        : texto(entrada.descripcion, 'descripcion', LIMITES_TEXTO.descripcion),
      autor: entrada.autor === undefined ? '' : texto(entrada.autor, 'autor', LIMITES_TEXTO.autor),
      base: opcion(entrada.base ?? 'clasico', 'base', BASES),
      svg: {
        strokeWidth: numero(entrada.svg?.strokeWidth ?? 2, 'svg.strokeWidth', 0.5, 4),
        strokeLinecap: opcion(entrada.svg?.strokeLinecap ?? 'round', 'svg.strokeLinecap', LINECAPS),
        strokeLinejoin: opcion(entrada.svg?.strokeLinejoin ?? 'round', 'svg.strokeLinejoin', LINEJOINS)
      },
      motivo: validarMotivo(entrada.motivo),
      colores: {},
      fondo: {}
    }

    MODOS.forEach(modo => {
      pack.colores[modo] = validarPaleta(colores[modo], modo)
      pack.fondo[modo] = validarFondo(fondos[modo], modo)
    })

    if (Object.keys(pack.colores.dark).length === 0 && Object.keys(pack.colores.light).length === 0) {
      fallar('El paquete no define ningun color')
    }

    return { ok: true, pack }
  } catch (e) {
    if (e instanceof PackInvalido) return { ok: false, error: e.message }
    return { ok: false, error: 'El paquete no se pudo leer' }
  }
}
