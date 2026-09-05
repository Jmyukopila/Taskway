import { circulo, poligono, ngon, n } from './iconGeometry.js'

/* ==========================================================================
   Motivos — la firma visual de cada variante de tema.
   Cada motivo es una forma CERRADA centrada en (cx, cy) con radio r, para que
   funcione igual trazada (outline) que restada del contorno (relleno).
   Las formas de un mismo motivo nunca se solapan entre si: con fill-rule
   "evenodd" un solape volveria a rellenar el hueco.
   ========================================================================== */

/** Punto solido — Clasico: geometria pura, sin ornamento. */
function punto(cx, cy, r) {
  return circulo(cx, cy, r * 0.6)
}

/** Flor de cuatro petalos — Flora / Rosas. */
function flor(cx, cy, r) {
  let d = ''
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 - Math.PI / 2
    d += circulo(cx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52, r * 0.47)
  }
  return d
}

/** Corazon — Flora / Corazones. */
function corazon(cx, cy, r) {
  return `M${n(cx)} ${n(cy + r * 0.95)}` +
    `C${n(cx - r * 1.45)} ${n(cy - r * 0.1)} ${n(cx - r * 0.7)} ${n(cy - r * 1.35)} ${n(cx)} ${n(cy - r * 0.3)}` +
    `C${n(cx + r * 0.7)} ${n(cy - r * 1.35)} ${n(cx + r * 1.45)} ${n(cy - r * 0.1)} ${n(cx)} ${n(cy + r * 0.95)}z`
}

/** Carita — Flora / Kawaii: dos ojos y una sonrisa. */
function carita(cx, cy, r) {
  const ojo = r * 0.24
  return circulo(cx - r * 0.45, cy - r * 0.3, ojo) +
    circulo(cx + r * 0.45, cy - r * 0.3, ojo) +
    `M${n(cx - r * 0.58)} ${n(cy + r * 0.25)}` +
    `q${n(r * 0.58)} ${n(r * 0.8)} ${n(r * 1.16)} 0` +
    `q${n(-r * 0.58)} ${n(r * 0.34)} ${n(-r * 1.16)} 0z`
}

/** Hoja de lanza — Acero / Guerra. */
function lanza(cx, cy, r) {
  return poligono([
    [cx, cy - r],
    [cx + r * 0.78, cy + r * 0.85],
    [cx, cy + r * 0.4],
    [cx - r * 0.78, cy + r * 0.85]
  ])
}

/** Galon de velocidad — Acero / Deporte. */
function galon(cx, cy, r) {
  return poligono([
    [cx - r * 0.85, cy - r * 0.85],
    [cx + r * 0.25, cy],
    [cx - r * 0.85, cy + r * 0.85],
    [cx - r * 0.1, cy + r * 0.85],
    [cx + r * 0.95, cy],
    [cx - r * 0.1, cy - r * 0.85]
  ])
}

/** Hexagono — Acero / Tech. */
function hexagono(cx, cy, r) {
  return ngon(cx, cy, r * 0.92, 6, 0)
}

/** Rombo — fallback de Acero sin variante. */
function rombo(cx, cy, r) {
  return ngon(cx, cy, r * 0.95, 4)
}

export const MOTIVOS = {
  clasico: punto,
  flora: flor,
  acero: rombo,
  'flora.rosas': flor,
  'flora.corazones': corazon,
  'flora.kawaii': carita,
  'acero.guerra': lanza,
  'acero.deporte': galon,
  'acero.tech': hexagono
}

export function getMotivo(familia, variante) {
  const key = variante ? `${familia}.${variante}` : familia
  return MOTIVOS[key] || MOTIVOS[familia] || MOTIVOS.clasico
}

/**
 * Motivo de un paquete descargado. Llega como datos ya validados
 * (packSchema): subpaths en coordenadas unitarias alrededor del origen que
 * aqui se escalan por el radio y se trasladan al punto focal del icono.
 */
export function motivoDesdeSpec(spec) {
  return (cx, cy, r) => spec.map(sub => sub.map(([letra, ...vals]) => {
    if (letra === 'Z') return 'z'
    if (letra === 'A') {
      const [rx, ry, rot, largeArc, sweep, x, y] = vals
      return `A${n(rx * r)} ${n(ry * r)} ${n(rot)} ${largeArc} ${sweep} ${n(cx + x * r)} ${n(cy + y * r)}`
    }
    const puntos = []
    for (let i = 0; i < vals.length; i += 2) {
      puntos.push(`${n(cx + vals[i] * r)} ${n(cy + vals[i + 1] * r)}`)
    }
    return letra + puntos.join(' ')
  }).join('')).join('')
}
