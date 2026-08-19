/* ==========================================================================
   Geometria de iconos — helpers para construir paths SVG en un lienzo 24x24.
   Todos devuelven subpaths cerrados, aptos tanto para trazo (outline) como
   para relleno con fill-rule="evenodd" (los huecos se restan del contorno).
   ========================================================================== */

const n = (v) => Math.round(v * 100) / 100

export function circulo(cx, cy, r) {
  return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`
}

export function poligono(pts) {
  return `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}z`
}

export function rrect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  if (rr <= 0) return poligono([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])
  return `M${n(x + rr)} ${n(y)}h${n(w - 2 * rr)}a${n(rr)} ${n(rr)} 0 0 1 ${n(rr)} ${n(rr)}` +
    `v${n(h - 2 * rr)}a${n(rr)} ${n(rr)} 0 0 1 ${n(-rr)} ${n(rr)}` +
    `h${n(-(w - 2 * rr))}a${n(rr)} ${n(rr)} 0 0 1 ${n(-rr)} ${n(-rr)}` +
    `v${n(-(h - 2 * rr))}a${n(rr)} ${n(rr)} 0 0 1 ${n(rr)} ${n(-rr)}z`
}

export function ngon(cx, cy, r, lados, rot = -Math.PI / 2) {
  const pts = []
  for (let i = 0; i < lados; i++) {
    const a = rot + (i * 2 * Math.PI) / lados
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return poligono(pts)
}

export function linea(x1, y1, x2, y2) {
  return `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`
}

/** Linea recta con grosor, como poligono cerrado (para el estado relleno). */
export function barra(x1, y1, x2, y2, w) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ox = (-dy / len) * (w / 2)
  const oy = (dx / len) * (w / 2)
  return poligono([
    [x1 + ox, y1 + oy], [x2 + ox, y2 + oy],
    [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]
  ])
}

/** Polilinea con grosor como un unico poligono cerrado (sin solapes internos). */
export function barraQuebrada(pts, w) {
  const izq = []
  const der = []
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[i - 1]
    const next = pts[i + 1]
    const acum = [0, 0]
    let count = 0
    const seg = (a, b) => {
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy) || 1
      acum[0] += (-dy / len) * (w / 2)
      acum[1] += (dx / len) * (w / 2)
      count++
    }
    if (prev) seg(prev, pts[i])
    if (next) seg(pts[i], next)
    const ox = acum[0] / count
    const oy = acum[1] / count
    izq.push([pts[i][0] + ox, pts[i][1] + oy])
    der.push([pts[i][0] - ox, pts[i][1] - oy])
  }
  return poligono([...izq, ...der.reverse()])
}

/** Rayos radiales: trazos en outline, poligonos en relleno. */
export function rayos(cx, cy, r0, r1, cantidad, w, relleno, rot = -Math.PI / 2) {
  const out = []
  for (let i = 0; i < cantidad; i++) {
    const a = rot + (i * 2 * Math.PI) / cantidad
    const c = Math.cos(a)
    const s = Math.sin(a)
    const x1 = cx + c * r0
    const y1 = cy + s * r0
    const x2 = cx + c * r1
    const y2 = cy + s * r1
    out.push(relleno ? barra(x1, y1, x2, y2, w) : linea(x1, y1, x2, y2))
  }
  return out
}

export { n }

/** Rueda dentada: dientes rectos alternando radio externo e interno. */
export function engrane(cx, cy, rExt, rInt, dientes) {
  const pts = []
  const paso = Math.PI / dientes
  const ancho = paso * 0.52
  for (let i = 0; i < dientes; i++) {
    const a = i * 2 * paso - Math.PI / 2
    pts.push([cx + rInt * Math.cos(a - paso + ancho), cy + rInt * Math.sin(a - paso + ancho)])
    pts.push([cx + rExt * Math.cos(a - ancho), cy + rExt * Math.sin(a - ancho)])
    pts.push([cx + rExt * Math.cos(a + ancho), cy + rExt * Math.sin(a + ancho)])
    pts.push([cx + rInt * Math.cos(a + paso - ancho), cy + rInt * Math.sin(a + paso - ancho)])
  }
  return poligono(pts)
}
