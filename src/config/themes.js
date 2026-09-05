export const TEMAS = {
  default: {
    name: 'Default',
    icon: 'temaDefault',
    light: {
      fondo: '#ffffff',
      card: '#f5f5f5',
      'card-hover': '#eeeeee',
      teal: '#1D9E75',
      'teal-hover': '#17a57a',
      purple: '#7F77DD',
      'purple-hover': '#9088e8',
      muted: '#9ca3af',
      border: '#e5e5e5',
      'text': '#1a1a1a',
      'text-secondary': '#6b7280',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    },
    dark: {
      fondo: '#0f0f0f',
      card: '#1a1a1a',
      'card-hover': '#222222',
      teal: '#1D9E75',
      'teal-hover': '#17a57a',
      purple: '#7F77DD',
      'purple-hover': '#9088e8',
      muted: '#6b7280',
      border: '#2a2a2a',
      'text': '#f3f4f6',
      'text-secondary': '#9ca3af',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    }
  },
  sepia: {
    name: 'Sepia',
    icon: 'temaSepia',
    light: {
      fondo: '#fdf6e3',
      card: '#eee8d5',
      'card-hover': '#e6dfc8',
      teal: '#2d8a6e',
      'teal-hover': '#259d7c',
      purple: '#8b7ec8',
      'purple-hover': '#9b8ed8',
      muted: '#8a7e6b',
      border: '#d5cdb8',
      'text': '#3a3220',
      'text-secondary': '#6b5e4a',
      danger: '#cc3333',
      success: '#22c55e',
      warning: '#d4940a'
    },
    dark: {
      fondo: '#1a1814',
      card: '#2a2620',
      'card-hover': '#353028',
      teal: '#3da07e',
      'teal-hover': '#4ab08c',
      purple: '#9b8ed8',
      'purple-hover': '#ab9ee8',
      muted: '#7a7060',
      border: '#3a342c',
      'text': '#e8ddd0',
      'text-secondary': '#a09888',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    }
  },
  ocean: {
    name: 'Ocean',
    icon: 'temaOcean',
    light: {
      fondo: '#f0f7ff',
      card: '#e2edf8',
      'card-hover': '#d4e4f2',
      teal: '#0d9488',
      'teal-hover': '#0fb5a8',
      purple: '#6366f1',
      'purple-hover': '#7577f5',
      muted: '#7a8ea0',
      border: '#c8d8e8',
      'text': '#0c1e2e',
      'text-secondary': '#4a6a82',
      danger: '#dc2626',
      success: '#16a34a',
      warning: '#d97706'
    },
    dark: {
      fondo: '#0a1628',
      card: '#111d35',
      'card-hover': '#182848',
      teal: '#0d9488',
      'teal-hover': '#0fb5a8',
      purple: '#6366f1',
      'purple-hover': '#7577f5',
      muted: '#5a7a92',
      border: '#1a2a45',
      'text': '#dce8f4',
      'text-secondary': '#8aa8c2',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    }
  },
  minimal: {
    name: 'Minimal',
    icon: 'temaMinimal',
    light: {
      fondo: '#fafafa',
      card: '#f0f0f0',
      'card-hover': '#e8e8e8',
      teal: '#555555',
      'teal-hover': '#666666',
      purple: '#444444',
      'purple-hover': '#555555',
      muted: '#aaaaaa',
      border: '#dddddd',
      'text': '#111111',
      'text-secondary': '#666666',
      danger: '#cc3333',
      success: '#22c55e',
      warning: '#d4940a'
    },
    dark: {
      fondo: '#121212',
      card: '#1e1e1e',
      'card-hover': '#2a2a2a',
      teal: '#888888',
      'teal-hover': '#999999',
      purple: '#777777',
      'purple-hover': '#888888',
      muted: '#666666',
      border: '#2e2e2e',
      'text': '#e0e0e0',
      'text-secondary': '#888888',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    }
  }
}

function rgb(hex) {
  const value = hex.slice(1)
  const full = value.length === 3 ? [...value].map(c => c + c).join('') : value
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16))
}

function mezclar(a, b, peso) {
  return a.map((v, i) => Math.round(v * peso + b[i] * (1 - peso)))
}

function opaco(hex, fondo) {
  const alfa = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1
  return mezclar(rgb(hex), fondo, alfa)
}

function hexadecimal(color) {
  return '#' + color.map(v => v.toString(16).padStart(2, '0')).join('')
}

function luminancia(color) {
  return color.map(v => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }).reduce((total, c, i) => total + c * [0.2126, 0.7152, 0.0722][i], 0)
}

function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (oscuro + 0.05)
}

function tinta(fondo) {
  return contraste([255, 255, 255], fondo) > contraste([0, 0, 0], fondo)
    ? [255, 255, 255] : [0, 0, 0]
}

function legible(color, fondo) {
  const destino = tinta(fondo)
  for (let paso = 0; paso <= 100; paso++) {
    const candidato = mezclar(color, destino, 1 - paso / 100)
    if (contraste(candidato, fondo) >= 4.5) return candidato
  }
  return destino
}

export function getVisualTokens(paleta, familia) {
  const fondo = opaco(paleta.fondo, [255, 255, 255])
  const superficie = opaco(paleta.card, fondo)
  const acento = opaco(paleta.teal, superficie)
  const readable = key => hexadecimal(legible(opaco(paleta[key], superficie), superficie))
  const evento = legible(opaco(paleta.warning, superficie), superficie)
  return {
    'calendar-surface': hexadecimal(superficie),
    'calendar-selected': hexadecimal(acento),
    'calendar-text': readable('text'),
    'calendar-muted': readable('text-secondary'),
    'calendar-accent': readable('teal'),
    'calendar-task': readable('purple'),
    'calendar-event': hexadecimal(evento),
    'on-accent': hexadecimal(tinta(acento)),
    'on-event': hexadecimal(tinta(evento)),
    icon: readable('teal'),
    'icon-muted': readable('text-secondary'),
    'control-radius': familia === 'acero' ? '3px' : familia === 'flora' ? '18px' : '10px',
    'panel-radius': familia === 'acero' ? '6px' : familia === 'flora' ? '26px' : '16px'
  }
}
