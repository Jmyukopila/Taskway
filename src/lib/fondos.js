/* ==========================================================================
   Fondos de los paquetes: de especificacion validada a CSS.

   Solo se construyen gradientes a partir de valores ya comprobados por
   packSchema (colores hexadecimales y numeros acotados). No se concatena
   ninguna cadena que venga del paquete tal cual, para que un paquete importado
   no pueda inyectar CSS arbitrario.
   ========================================================================== */

const SIN_FONDO = { imagen: 'none', tamano: 'auto', posicion: '0 0', repeticion: 'no-repeat' }

const r2 = (v) => Math.round(v * 100) / 100

/**
 * Casilla de patron a SVG embebido. El SVG lo compone esta plantilla: del
 * paquete solo entran numeros y colores ya validados, y todo se codifica con
 * encodeURIComponent, asi que no hay forma de inyectar marcado.
 */
function patronSVG(capa) {
  const alto = r2(100 * capa.alto)
  const d = capa.forma.map(sub => sub.map(([letra, ...vals]) => {
    if (letra === 'Z') return 'z'
    if (letra === 'A') {
      const [rx, ry, rot, arco, barrido, x, y] = vals
      return `A${r2(rx * 100)} ${r2(ry * 100)} ${r2(rot)} ${arco} ${barrido} ${r2(x * 100)} ${r2(y * 100)}`
    }
    const puntos = []
    for (let i = 0; i < vals.length; i += 2) puntos.push(`${r2(vals[i] * 100)} ${r2(vals[i + 1] * 100)}`)
    return letra + puntos.join(' ')
  }).join('')).join('')

  // Atributos con comillas dobles a proposito: encodeURIComponent NO escapa el
  // apostrofo, asi que con comillas simples el data URI conservaria comillas
  // literales y rompería el url("...") al usarlo en un atributo style.
  const pintura = capa.relleno
    ? `fill="${capa.color}"`
    : `fill="none" stroke="${capa.color}" stroke-width="${r2(capa.grosor)}" stroke-linecap="round" stroke-linejoin="round"`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${alto}">` +
    `<path d="${d}" ${pintura}/></svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function capaCSS(capa) {
  switch (capa.tipo) {
    case 'radial':
      return {
        imagen: `radial-gradient(${r2(capa.ancho)}% ${r2(capa.alto)}% at ${r2(capa.x)}% ${r2(capa.y)}%, ${capa.color} 0%, transparent 100%)`,
        tamano: 'auto',
        posicion: '0 0',
        repeticion: 'no-repeat'
      }
    case 'lineal':
      return {
        imagen: `linear-gradient(${r2(capa.angulo)}deg, ${capa.color} 0%, ${capa.color2} 100%)`,
        tamano: 'auto',
        posicion: '0 0',
        repeticion: 'no-repeat'
      }
    case 'puntos':
      return {
        imagen: `radial-gradient(circle at center, ${capa.color} 0 ${r2(capa.radio)}px, transparent ${r2(capa.radio + 0.5)}px)`,
        tamano: `${r2(capa.paso)}px ${r2(capa.paso)}px`,
        posicion: '0 0',
        repeticion: 'repeat'
      }
    case 'rayas':
      return {
        imagen: `repeating-linear-gradient(${r2(capa.angulo)}deg, ${capa.color} 0 ${r2(capa.grosor)}px, transparent ${r2(capa.grosor)}px ${r2(capa.paso)}px)`,
        tamano: 'auto',
        posicion: '0 0',
        repeticion: 'repeat'
      }
    case 'patron':
      return {
        imagen: patronSVG(capa),
        tamano: `${r2(capa.paso)}px ${r2(capa.paso * capa.alto)}px`,
        posicion: '0 0',
        repeticion: 'repeat'
      }
    case 'rejilla':
      return {
        imagen: `repeating-linear-gradient(0deg, ${capa.color} 0 ${r2(capa.grosor)}px, transparent ${r2(capa.grosor)}px ${r2(capa.paso)}px), ` +
          `repeating-linear-gradient(90deg, ${capa.color} 0 ${r2(capa.grosor)}px, transparent ${r2(capa.grosor)}px ${r2(capa.paso)}px)`,
        tamano: 'auto',
        posicion: '0 0',
        repeticion: 'repeat',
        capasExtra: 1
      }
    default:
      return null
  }
}

/**
 * Convierte la especificacion de fondo de un paquete en las cuatro propiedades
 * que consume el CSS (--fondo-imagen, --fondo-tamano, --fondo-posicion,
 * --fondo-repeticion). Devuelve el fondo vacio si no hay especificacion.
 */
export function fondoACSS(fondo) {
  if (!fondo?.capas?.length) return SIN_FONDO

  const imagenes = []
  const tamanos = []
  const posiciones = []
  const repeticiones = []

  fondo.capas.forEach(capa => {
    const css = capaCSS(capa)
    if (!css) return
    imagenes.push(css.imagen)
    // "rejilla" produce dos gradientes en una sola capa: hay que repetir sus
    // valores de tamano/posicion/repeticion para que las listas cuadren.
    const veces = 1 + (css.capasExtra || 0)
    for (let i = 0; i < veces; i++) {
      tamanos.push(css.tamano)
      posiciones.push(css.posicion)
      repeticiones.push(css.repeticion)
    }
  })

  if (imagenes.length === 0) return SIN_FONDO

  return {
    imagen: imagenes.join(', '),
    tamano: tamanos.join(', '),
    posicion: posiciones.join(', '),
    repeticion: repeticiones.join(', ')
  }
}

export { SIN_FONDO }
