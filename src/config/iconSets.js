import { circulo, poligono, rrect, ngon, linea, barra, barraQuebrada, rayos, engrane } from './iconGeometry.js'
import { getMotivo, motivoDesdeSpec } from './iconMotivos.js'

/* ==========================================================================
   Sets de iconos por familia.

   Cada familia tiene su propio lenguaje de formas:
     clasico -> circulos y rectangulos redondeados, geometria neutra
     flora   -> formas organicas, esquinas muy suaves, petalos
     acero   -> hexagonos, cortes en diagonal, angulos duros

   Sobre esa base, la VARIANTE inyecta su motivo (flor, corazon, carita,
   lanza, galon, hexagono) en el punto focal de cada icono: el nucleo del sol,
   el dia marcado del calendario, el centro de la diana, la marca del reloj,
   el sello de la tarea y el pico del grafico.

   Formato de cada icono:
     outline: [d]                 -> paths trazados
     solid:   { cut, extra: [d] } -> "cut" se rellena con fill-rule evenodd
                                     (sus subpaths internos quedan como hueco),
                                     "extra" son paths rellenos independientes.
   Los subpaths de un mismo "cut" nunca se solapan: con evenodd un solape
   volveria a rellenar el hueco.
   ========================================================================== */

function setClasico(m) {
  const manecillas = [[12, 6.9], [12, 12], [9.3, 14.4]]
  return {
    hoy: {
      outline: [circulo(12, 12, 5.2), ...rayos(12, 12, 7.4, 9.7, 8, 0, false), m(12, 12, 2.3)],
      solid: { cut: circulo(12, 12, 5.6) + m(12, 12, 2.4), extra: rayos(12, 12, 7.4, 9.7, 8, 1.7, true) }
    },
    calendario: {
      outline: [
        rrect(3, 5, 18, 16, 2.6), linea(3.9, 9.6, 20.1, 9.6),
        linea(8, 2.8, 8, 6.4), linea(16, 2.8, 16, 6.4), m(12, 15.4, 2.7)
      ],
      solid: {
        cut: rrect(3, 5, 18, 16, 2.6) + barra(3.9, 9.6, 20.1, 9.6, 1) + m(12, 15.4, 2.7),
        extra: [barra(8, 2.7, 8, 6, 1.8), barra(16, 2.7, 16, 6, 1.8)]
      }
    },
    habitos: {
      outline: [circulo(12, 12, 8.7), circulo(12, 12, 5), m(12, 12, 2.4)],
      solid: { cut: circulo(12, 12, 8.7) + circulo(12, 12, 5) + m(12, 12, 2.4), extra: [] }
    },
    horario: {
      outline: [circulo(12, 12, 8.8), linea(12, 6.9, 12, 12), linea(12, 12, 9.3, 14.4), m(17.2, 12, 1.7)],
      solid: { cut: circulo(12, 12, 8.8) + barraQuebrada(manecillas, 1.7) + m(17.2, 12, 1.7), extra: [] }
    },
    tareas: {
      outline: [rrect(4, 4.8, 16, 16.2, 2.6), rrect(8.6, 2.4, 6.8, 4, 1.3), m(12, 13.6, 3), linea(8.4, 18.6, 15.6, 18.6)],
      solid: {
        cut: rrect(4, 4.8, 16, 16.2, 2.6) + m(12, 13.6, 3) + barra(8.4, 18.6, 15.6, 18.6, 1.2),
        extra: [rrect(8.6, 2.4, 6.8, 4, 1.3)]
      }
    },
    dashboard: {
      outline: [
        rrect(4.4, 14.6, 3.6, 5, 1.1), rrect(10.2, 11.8, 3.6, 7.8, 1.1),
        rrect(16, 8.8, 3.6, 10.8, 1.1), m(17.8, 5.4, 2)
      ],
      solid: {
        cut: null,
        extra: [
          rrect(4.4, 14.6, 3.6, 5, 1.1), rrect(10.2, 11.8, 3.6, 7.8, 1.1),
          rrect(16, 8.8, 3.6, 10.8, 1.1), m(17.8, 5.4, 2)
        ]
      }
    },
    academico: {
      outline: [
        poligono([[12, 3.8], [20.4, 8.4], [12, 13], [3.6, 8.4]]),
        'M7.6 11.2L12 13.8 16.4 11.2',
        'M12 8.4h6.2v7.4',
        circulo(18.2, 16.9, 1.45),
        m(12, 8.4, 1.9)
      ],
      solid: {
        cut: poligono([[12, 3.8], [20.4, 8.4], [12, 13], [3.6, 8.4]]) + m(12, 8.4, 2),
        extra: [
          barraQuebrada([[7.6, 11.2], [12, 13.8], [16.4, 11.2]], 1.4),
          barra(12, 8.4, 18.2, 8.4, 1.3), barra(18.2, 8.4, 18.2, 16, 1.3),
          circulo(18.2, 16.9, 1.7)
        ]
      }
    }
  }
}

function setFlora(m) {
  const petalos = (relleno) => {
    const out = []
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2
      out.push(circulo(12 + Math.cos(a) * 6.6, 12 + Math.sin(a) * 6.6, relleno ? 2.6 : 2.5))
    }
    return out
  }
  const manecillas = [[12, 7.2], [12, 12], [9.5, 14.2]]
  return {
    hoy: {
      outline: [circulo(12, 12, 4.2), ...petalos(false), m(12, 12, 2)],
      solid: { cut: circulo(12, 12, 4.6) + m(12, 12, 2), extra: petalos(true) }
    },
    calendario: {
      outline: [
        rrect(3, 5, 18, 16, 5.4), linea(4.6, 9.8, 19.4, 9.8),
        linea(8, 2.9, 8, 6.4), linea(16, 2.9, 16, 6.4), m(12, 15.5, 2.7)
      ],
      solid: {
        cut: rrect(3, 5, 18, 16, 5.4) + barra(4.6, 9.8, 19.4, 9.8, 1) + m(12, 15.5, 2.7),
        extra: [barra(8, 2.9, 8, 6, 1.6), barra(16, 2.9, 16, 6, 1.6)]
      }
    },
    habitos: {
      outline: [rrect(3.3, 3.3, 17.4, 17.4, 7.6), rrect(7.1, 7.1, 9.8, 9.8, 4.3), m(12, 12, 2.3)],
      solid: { cut: rrect(3.3, 3.3, 17.4, 17.4, 7.6) + rrect(7.1, 7.1, 9.8, 9.8, 4.3) + m(12, 12, 2.3), extra: [] }
    },
    horario: {
      outline: [circulo(12, 12, 8.5), linea(12, 7.2, 12, 12), linea(12, 12, 9.5, 14.2), m(16.9, 12, 1.7)],
      solid: { cut: circulo(12, 12, 8.5) + barraQuebrada(manecillas, 1.6) + m(16.9, 12, 1.7), extra: [] }
    },
    tareas: {
      outline: [rrect(4, 4.8, 16, 16.2, 4.8), rrect(8.5, 2.5, 7, 4, 2), m(12, 13.6, 3), linea(8.6, 18.6, 15.4, 18.6)],
      solid: {
        cut: rrect(4, 4.8, 16, 16.2, 4.8) + m(12, 13.6, 3) + barra(8.6, 18.6, 15.4, 18.6, 1.1),
        extra: [rrect(8.5, 2.5, 7, 4, 2)]
      }
    },
    dashboard: {
      outline: [
        rrect(4.4, 14.6, 3.6, 5, 1.8), rrect(10.2, 11.8, 3.6, 7.8, 1.8),
        rrect(16, 8.8, 3.6, 10.8, 1.8), m(17.8, 5.4, 2)
      ],
      solid: {
        cut: null,
        extra: [
          rrect(4.4, 14.6, 3.6, 5, 1.8), rrect(10.2, 11.8, 3.6, 7.8, 1.8),
          rrect(16, 8.8, 3.6, 10.8, 1.8), m(17.8, 5.4, 2)
        ]
      }
    },
    academico: {
      outline: [
        poligono([[12, 4.4], [19.8, 8.5], [12, 12.6], [4.2, 8.5]]),
        'M8 11Q12 15.4 16 11',
        'M12 8.5q6 0 6 3v4.2',
        circulo(18, 16.6, 1.6),
        m(12, 8.5, 1.8)
      ],
      solid: {
        cut: poligono([[12, 4.4], [19.8, 8.5], [12, 12.6], [4.2, 8.5]]) + m(12, 8.5, 1.9),
        extra: [
          'M8 11Q12 15 16 11L16 11.9Q12 15.9 8 11.9z',
          barra(12, 8.5, 18, 8.5, 1.3), barra(18, 8.5, 18, 16, 1.3),
          circulo(18, 16.6, 1.85)
        ]
      }
    }
  }
}

function setAcero(m) {
  const rotRayos = -Math.PI / 2 + Math.PI / 6
  const manecillas = [[12, 6.6], [12, 12], [9, 14.6]]
  const cuerpoCal = poligono([[3, 5], [17.4, 5], [21, 8.6], [21, 21], [3, 21]])
  const cuerpoTarea = poligono([[4, 4.8], [20, 4.8], [20, 21], [4, 21]])
  const pestanaTarea = poligono([[8.4, 2.4], [15.6, 2.4], [15.6, 6.4], [8.4, 6.4]])
  const barraSesgada = (x, top, w) => poligono([[x, 19.6], [x, top + 1.5], [x + w, top], [x + w, 19.6]])
  return {
    hoy: {
      outline: [ngon(12, 12, 5.5, 6), ...rayos(12, 12, 7.3, 9.8, 6, 0, false, rotRayos), m(12, 12, 2.2)],
      solid: { cut: ngon(12, 12, 5.8, 6) + m(12, 12, 2.3), extra: rayos(12, 12, 7.3, 9.8, 6, 1.9, true, rotRayos) }
    },
    calendario: {
      outline: [
        cuerpoCal, linea(3, 9.8, 21, 9.8),
        linea(7.6, 2.6, 7.6, 6.4), linea(15.6, 2.6, 15.6, 6.4), m(12, 15.6, 2.7)
      ],
      solid: {
        cut: cuerpoCal + barra(3.6, 9.8, 20.4, 9.8, 1.1) + m(12, 15.6, 2.7),
        extra: [barra(7.6, 2.6, 7.6, 6, 2), barra(15.6, 2.6, 15.6, 6, 2)]
      }
    },
    habitos: {
      outline: [ngon(12, 12, 9, 6), ngon(12, 12, 5.2, 6), m(12, 12, 2.3)],
      solid: { cut: ngon(12, 12, 9, 6) + ngon(12, 12, 5.2, 6) + m(12, 12, 2.3), extra: [] }
    },
    horario: {
      outline: [ngon(12, 12, 9, 6), linea(12, 6.6, 12, 12), linea(12, 12, 9, 14.6), m(17, 12, 1.7)],
      solid: { cut: ngon(12, 12, 9, 6) + barraQuebrada(manecillas, 1.9) + m(17, 12, 1.7), extra: [] }
    },
    tareas: {
      outline: [cuerpoTarea, pestanaTarea, m(12, 13.6, 3), linea(8.2, 18.6, 15.8, 18.6)],
      solid: {
        cut: cuerpoTarea + m(12, 13.6, 3) + barra(8.2, 18.6, 15.8, 18.6, 1.3),
        extra: [pestanaTarea]
      }
    },
    dashboard: {
      outline: [barraSesgada(4.4, 14.6, 3.6), barraSesgada(10.2, 11.8, 3.6), barraSesgada(16, 8.8, 3.6), m(17.8, 5.2, 2)],
      solid: {
        cut: null,
        extra: [barraSesgada(4.4, 14.6, 3.6), barraSesgada(10.2, 11.8, 3.6), barraSesgada(16, 8.8, 3.6), m(17.8, 5.2, 2)]
      }
    },
    academico: {
      outline: [
        poligono([[12, 3.2], [21, 8.4], [12, 13.6], [3, 8.4]]),
        'M6.6 11.4L12 14.4 17.4 11.4',
        'M12 8.4h6.8V16.2',
        ngon(18.8, 17.2, 1.75, 6),
        m(12, 8.4, 2.1)
      ],
      solid: {
        cut: poligono([[12, 3.2], [21, 8.4], [12, 13.6], [3, 8.4]]) + m(12, 8.4, 2.2),
        extra: [
          barraQuebrada([[6.6, 11.4], [12, 14.4], [17.4, 11.4]], 1.6),
          barra(12, 8.4, 18.8, 8.4, 1.5), barra(18.8, 8.4, 18.8, 16.4, 1.5),
          ngon(18.8, 17.2, 1.95, 6)
        ]
      }
    }
  }
}

const CONSTRUCTORES = { clasico: setClasico, flora: setFlora, acero: setAcero }

/* ==================== ICONOS DE UTILIDAD ====================
   Solo trazo. Comparten la semantica pero no la geometria: cada familia
   redondea, suaviza o angula la misma forma, y el grosor/remate del trazo
   viene de estilos.js. La racha y el estado vacio llevan el motivo de la
   variante, porque son los momentos donde la app "firma". */

function utilidades(familia, m) {
  const angular = familia === 'acero'
  const suave = familia === 'flora'
  const lupa = angular ? ngon(11, 11, 6.4, 6) : circulo(11, 11, 6.2)
  const llama = angular
    ? 'M12.6 2.2l4.4 6.6-2.2 1 3.2 5.2-1.6 1.6.8 3.6-5.2 1.8-5.6-2.6.6-4.6 2.6-2-1.2-2.8 4.2-3z'
    : 'M12.4 2.4c.6 3 2.4 4.8 4 6.8 1.6 2 2.2 4 2.2 5.8a6.6 6.6 0 11-13.2 0c0-2 .8-3.8 2.2-5.4.2 1.2.8 2 1.6 2.4.2-3.6 1.4-6.8 3.2-9.6z'

  return {
    check: angular ? 'M4.4 12l5 5L19.8 6' : suave ? 'M5.6 12.8l4.2 4.2L18.6 7.4' : 'M5 12.5l4.4 4.5L19 7',
    close: angular ? 'M5.2 5.2l13.6 13.6M18.8 5.2L5.2 18.8' : suave ? 'M7 7l10 10M17 7L7 17' : 'M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6',
    mas: angular ? 'M12 4v16M4 12h16' : suave ? 'M12 5.6v12.8M5.6 12h12.8' : 'M12 4.8v14.4M4.8 12h14.4',
    chevronDerecha: angular ? 'M9 4.5l7.5 7.5L9 19.5' : suave ? 'M10 6.4l5.6 5.6L10 17.6' : 'M9.5 5.5l6.5 6.5-6.5 6.5',
    chevronIzquierda: angular ? 'M15 4.5L7.5 12l7.5 7.5' : suave ? 'M14 6.4L8.4 12l5.6 5.6' : 'M14.5 5.5L8 12l6.5 6.5',
    chevronAbajo: angular ? 'M4.5 9L12 16.5 19.5 9' : suave ? 'M6.4 10L12 15.6 17.6 10' : 'M5.5 9.5l6.5 6.5 6.5-6.5',
    buscar: `${lupa}${linea(15.4, 15.4, 20.2, 20.2)}`,
    editar: angular
      ? 'M16.4 2.8l4.8 4.8L8 20.8 2.6 21.4 3.2 16z'
      : 'M16.8 3.2a2.7 2.7 0 013.8 3.8L8 19.8 2.8 21.2 4.2 16.4z',
    borrar: angular
      ? 'M4 6.4h16M9.2 6.4V3.6h5.6v2.8M5.8 6.4l1 14.2h10.4l1-14.2M10 10.4v6.2M14 10.4v6.2'
      : 'M4.2 6.6h15.6M9.4 6.6V4.2a1 1 0 011-1h3.2a1 1 0 011 1v2.4M6 6.6l1 13.4a1.6 1.6 0 001.6 1.5h6.8a1.6 1.6 0 001.6-1.5l1-13.4M10 10.6v6.4M14 10.6v6.4',
    campana: angular
      ? 'M5 17.6h14L17.4 15V10a5.4 5.4 0 00-10.8 0v5zM9.6 20.4h4.8'
      : 'M6.6 16.8a1 1 0 01-.8-1.6l1-1.4V10a5.2 5.2 0 0110.4 0v3.8l1 1.4a1 1 0 01-.8 1.6zM9.8 19.8a2.4 2.4 0 004.4 0',
    descargar: 'M12 3.6v11.2M7.6 10.8L12 15.2l4.4-4.4M4.4 18.4h15.2',
    subir: 'M12 20.4V9.2M7.6 13.2L12 8.8l4.4 4.4M4.4 4.4h15.2',
    engranaje: `${engrane(12, 12, 9.6, 6.9, angular ? 6 : 8)}${angular ? ngon(12, 12, 3.2, 6) : circulo(12, 12, 3.1)}`,
    sol: `${circulo(12, 12, 4.4)}${rayos(12, 12, 6.8, 9.4, 8, 0, false).join('')}`,
    luna: angular
      ? 'M20.4 14.6A8.6 8.6 0 019.4 3.6 9 9 0 1020.4 14.6z'
      : 'M20.6 14.8A8.8 8.8 0 019.2 3.4 9.2 9.2 0 1020.6 14.8z',
    recurrente: angular
      ? 'M20 12a8 8 0 01-13.6 5.6M4 12a8 8 0 0113.6-5.6M17.6 2.8v3.6H14M6.4 21.2v-3.6H10'
      : 'M19.8 12a7.8 7.8 0 01-13.2 5.6M4.2 12a7.8 7.8 0 0113.2-5.6M17.4 3.2v3.2h-3.2M6.6 20.8v-3.2h3.2',
    racha: `${llama}${m(12, 15.4, 2.4)}`,
    vacio: `${angular ? ngon(12, 12, 8.8, 6) : circulo(12, 12, 8.8)}${m(12, 12, 3.4)}`,
    puntos: `${circulo(5.6, 12, 1.5)}${circulo(12, 12, 1.5)}${circulo(18.4, 12, 1.5)}`
  }
}

/* ==================== ICONOS DE TEMA ====================
   Cada tema de color tiene su propia metafora, no una forma generica:
   Default = contraste dia/noche, Sepia = pagina de papel, Ocean = oleaje,
   Minimal = un solo trazo. Cada familia la dibuja a su manera. */

function temas(familia) {
  const angular = familia === 'acero'
  const suave = familia === 'flora'
  const marco = angular ? ngon(12, 12, 9, 6) : circulo(12, 12, 8.8)
  return {
    temaDefault: angular
      ? `${marco}${poligono([[12, 3], [19.8, 7.5], [19.8, 16.5], [12, 21]])}`
      : `${marco}M12 3.2a8.8 8.8 0 000 17.6z`,
    temaSepia: angular
      ? 'M4 4.4h9.6L20 8.8v10.8H4zM7.6 9.6h6M7.6 13.2h8.8M7.6 16.8h5.6'
      : `${rrect(4, 4.4, 16, 15.2, suave ? 3.6 : 1.8)}M7.6 9.6h6M7.6 13.2h8.8M7.6 16.8h5.6`,
    temaOcean: 'M2.6 8.4c2.6-2.4 5.2-2.4 7.8 0s5.2 2.4 7.8 0M2.6 13.2c2.6-2.4 5.2-2.4 7.8 0s5.2 2.4 7.8 0M2.6 18c2.6-2.4 5.2-2.4 7.8 0s5.2 2.4 7.8 0',
    temaMinimal: angular
      ? `${ngon(12, 12, 8.8, 6)}${ngon(12, 12, 2.2, 6)}`
      : `${rrect(3.4, 3.4, 17.2, 17.2, suave ? 6.4 : 2.6)}${circulo(12, 12, 2.2)}`
  }
}

/* Los tres iconos de familia muestran el lenguaje de formas de cada una. */
export const ICONOS_FAMILIA = {
  clasico: [circulo(12, 12, 8.6), circulo(12, 12, 3.4)],
  flora: [rrect(3.4, 3.4, 17.2, 17.2, 8.2), 'M12 7.4c3 1.8 4.4 3.6 4.4 5.8a4.4 4.4 0 01-8.8 0c0-2.2 1.4-4 4.4-5.8z'],
  acero: [ngon(12, 12, 9, 6), ngon(12, 12, 4.2, 6)]
}

/* ==================== CACHE ==================== */

const cache = new Map()
const cachePacks = new WeakMap()

/**
 * Set de iconos activo. Con `pack` (paquete descargado) la geometria base sale
 * de pack.base y el motivo de pack.motivo; sin el, de la familia y variante
 * integradas.
 */
export function getIconSet(familia, variante, pack = null) {
  const fam = CONSTRUCTORES[pack ? pack.base : familia] ? (pack ? pack.base : familia) : 'clasico'
  const cacheActiva = pack ? cachePacks : cache
  const key = pack || (variante ? `${fam}.${variante}` : fam)
  const guardado = cacheActiva.get(key)
  if (guardado) return guardado

  const motivo = pack ? motivoDesdeSpec(pack.motivo) : getMotivo(fam, variante)
  const set = {
    ...CONSTRUCTORES[fam](motivo),
    utilidades: utilidades(fam, motivo),
    temas: temas(fam)
  }
  cacheActiva.set(key, set)
  return set
}
