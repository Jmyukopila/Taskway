/* eslint-disable react-refresh/only-export-components */
import { useIconContext } from '../contexts/ThemeContext'
import { getSvgProps } from './estilos'

/* ==================== PATH DATA ==================== */

const F = {
  /* ———— HOY (sun / today) ———— */
  hoy: {
    clasico: {
      outline: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L12 14.17l7.59-7.59L19 8l-9 9z'
    },
    flora: {
      outline: 'M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 12l-4-4 1.5-1.5L11 13l4.5-4.5L17 10z',
      filled: 'M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-2 11l-3-3 1.06-1.06L10 12.88l4.94-4.94L16 9z'
    },
    acero: {
      outline: 'M12 2L4 8v8l8 6 8-6V8zM12 8v5l4 2',
      filled: 'M12 2L4 8v8l8 6 8-6V8zM10 15l-3-3 1.5-1.5L10 12l5.5-5.5L17 8z'
    },
    'flora.rosas': {
      outline: 'M12 3c3 0 6 2 7 5s0 6-3 8-6 2-7-1-1-6 0-8 3-4 3-4zm0 3v8m-4-4h8',
      filled: 'M12 2C7 2 3 6 3 12s4 10 9 10 9-4 9-9-4-9-9-9zm-1 5h2v6h-2zm-3 3h8'
    },
    'flora.corazones': {
      outline: 'M12 4l-2 2C5 10 3 13 3 16c0 3 2 5 5 5 1.5 0 3-1 3-1s1.5 1 3 1c3 0 5-2 5-5 0-3-2-6-6-10zm0 0l2 3M8 12h8',
      filled: 'M12 3l-3 3C5 10 3 13 3 16c0 3 2 5 5 5 2 0 4-2 4-2s2 2 4 2c3 0 5-2 5-5 0-3-2-6-6-10z'
    },
    'flora.kawaii': {
      outline: 'M12 4c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm-2 5h4v2h-4zM9 14h6',
      filled: 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm-3 8h6v2H9zM8 13h1v1H8zm6 0h1v1h-1z'
    },
    'acero.guerra': {
      outline: 'M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zM7 7l10 10M17 7L7 17',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6 6l12 12M18 6L6 18'
    },
    'acero.deporte': {
      outline: 'M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zM8 8l4 3 2-3 2 4-3 4H9l-3-4z',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 5h4l2 3-3 3h-2L8 10z'
    },
    'acero.tech': {
      outline: 'M12 3l8 5v8l-8 5-8-5V8zm0 3v12m-5-9l10 4m-10 2l10-4',
      filled: 'M12 2l10 6v8l-10 6L2 16V8zm5 8l-5-3-5 3 2 4h6z'
    }
  },

  /* ———— CALENDARIO ———— */
  calendario: {
    clasico: {
      outline: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      filled: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z'
    },
    flora: {
      outline: 'M6 4h12v2H6zM4 7h16v14H4zM7 11h10M7 15h8M7 19h6',
      filled: 'M6 4h12v2H6zM3 7h18v14H3zm5 4h8v1H8zm0 4h6v1H8zm0 4h4v1H8z'
    },
    acero: {
      outline: 'M6 3h12v2H6zM3 6h18v14H3zM7 10h10M7 14h8M7 18h6',
      filled: 'M18 2v2H6V2H4v2H2v17h20V4h-2V2zM4 8h16v12H4zm3 4h10v1H7zm0 4h8v1H7z'
    },
    'flora.rosas': {
      outline: 'M6 3h12v2H6zM4 6h16v14H4zM8 12h8M8 16h6',
      filled: 'M6 3h12v2H6zM3 6h18v14H3zm5 6h8v1H8zm0 4h6v1H8z'
    },
    'flora.corazones': {
      outline: 'M6 3h12v2H6zM4 6h16v14H4zM9 12c-1 0-2 1-1 2s1 2 2 2 2-1 2-2-1-2-2-2z',
      filled: 'M6 3h12v2H6zM3 6h18v14H3zm6 7c-1 0-1 1 0 2s1 1 2 1 1-1 0-2-1-1-2-1z'
    },
    'flora.kawaii': {
      outline: 'M6 3h12v2H6zM4 6h16v14H4zM8 11h8M8 15h5M9 18h4',
      filled: 'M6 3h12v2H6zM3 6h18v14H3zm5 5h8v1H8zm3 4h4v1h-4zM9 18h3v1H9z'
    },
    'acero.guerra': {
      outline: 'M5 4h14v16H5zm2 3h10v2H7zm0 4h6v2H7zm5 4h3v2h-3z',
      filled: 'M5 3h14v2H5zM3 6h18v15H3zm3 4h10v1H6zm0 4h6v1H6zm6 4h4v1h-4z'
    },
    'acero.deporte': {
      outline: 'M6 3h12v2H6zM4 6h16v14H4zM12 9v6M9 12h6',
      filled: 'M6 3h12v2H6zM3 6h18v14H3zm9 3v6M9 12h6'
    },
    'acero.tech': {
      outline: 'M6 3h12v2H6zM4 6h16v14H4zM8 10h2v2H8zm6 4h2v2h-2z',
      filled: 'M6 3h12v2H6zM3 6h18v14H3zm5 4h2v2H8zm6 4h2v2h-2z'
    }
  },

  /* ———— HABITOS ———— */
  habitos: {
    clasico: {
      outline: 'M18 20V10M12 20V4M6 20v-6',
      filled: 'M4 4h4v16H4zM10 8h4v12h-4zM16 2h4v18h-4z'
    },
    flora: {
      outline: 'M12 4C8 4 5 7 5 12c0 5 3 8 7 8s7-3 7-8c0-5-3-8-7-8zm-2 3h4v2h-4zm0 3h4v2h-4zm0 3h2v2h-2z',
      filled: 'M12 4C8 4 5 7 5 12c0 5 3 8 7 8s7-3 7-8c0-5-3-8-7-8zM8 8h2v6H8zm3-2h2v10h-2zm3 2h2v6h-2z'
    },
    acero: {
      outline: 'M5 4h4v16H5zM10 8h4v12h-4zM15 2h4v18h-4z',
      filled: 'M5 4h4v16H5zM10 8h4v12h-4zM15 2h4v18h-4z'
    },
    'flora.rosas': {
      outline: 'M8 4h8v3H8zm-2 5h12v11H6zm5 3l2 2 3-3',
      filled: 'M8 4h8v2H8zM5 7h14v13H5zm6 5l2 2 3-3-2-2-3 3z'
    },
    'flora.corazones': {
      outline: 'M8 4h8v3H8zm-2 5h12v11H6zm4 4l2-2 2 2v2h-4z',
      filled: 'M8 4h8v2H8zM5 7h14v13H5zm5 5l2-2 2 2-2 2z'
    },
    'flora.kawaii': {
      outline: 'M9 5h6v2H9zM6 8h12v10H6zm4 4h4v2h-4zM8 14h8',
      filled: 'M9 5h6v1H9zM5 8h14v11H5zm4 4h4v1H9zM7 14h10v1H7z'
    },
    'acero.guerra': {
      outline: 'M6 3h12v3H6zM4 8h16v13H4zm4 5l3-3 3 3-3 3z',
      filled: 'M6 3h12v2H6zM3 8h18v14H3zm5 5l3-3 3 3-3 3z'
    },
    'acero.deporte': {
      outline: 'M8 4h8v3H8zm-3 5h14v11H5zm6 3v6m-4-3h8',
      filled: 'M8 4h8v2H8zM4 7h16v13H4zm7 4v6m-3-3h6'
    },
    'acero.tech': {
      outline: 'M7 4h10v3H7zM4 8h16v12H4zm5 4l3-3 3 3-3 3zM8 15h8',
      filled: 'M7 4h10v2H7zM3 8h18v13H3zm6 4l3-3 3 3-3 3zM8 15h8v1H8z'
    }
  },

  /* ———— HORARIO (clock) ———— */
  horario: {
    clasico: {
      outline: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'
    },
    flora: {
      outline: 'M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 5v4.5l3.5 2.5',
      filled: 'M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 5v5l4 2-1 1.5-5-3V8z'
    },
    acero: {
      outline: 'M12 2L2 12l10 10L22 12zM12 7v6l5 3',
      filled: 'M12 2L2 12l10 10L22 12zm0 5v5l4 2-1 1-5-2.5V7z'
    },
    'flora.rosas': {
      outline: 'M12 5v7l4 3M12 4a8 8 0 100 16 8 8 0 000-16z',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 5v6l4 2-1 1.5-5-2.5V7z'
    },
    'flora.corazones': {
      outline: 'M12 5v7l4 3M12 4a8 8 0 100 16 8 8 0 000-16zM9 9h6',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 5v5l3 2-1 1-4-2V7z'
    },
    'flora.kawaii': {
      outline: 'M12 5v7l3 3M12 4a8 8 0 100 16 8 8 0 000-16zm-2 6h4',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6v5l2 2-1 1-3-3V8z'
    },
    'acero.guerra': {
      outline: 'M12 2L4 8v8l8 6 8-6V8zM12 7v6l4 2',
      filled: 'M12 2L2 9v6l10 7 10-7V9zm-1 5v5l3 2-1 1-4-2.5V7z'
    },
    'acero.deporte': {
      outline: 'M12 4a8 8 0 100 16 8 8 0 000-16zm0 3v6l5 3',
      filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4v6l4 2-1 1.5-5-2.5V6z'
    },
    'acero.tech': {
      outline: 'M12 3l8 5v8l-8 5-8-5V8zm0 4v6l4 2',
      filled: 'M12 2l10 6v8l-10 6L2 16V8zm0 5v5l3 2-1 1-4-2.5V7z'
    }
  },

  /* ———— TAREAS ———— */
  tareas: {
    clasico: {
      outline: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      filled: 'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z'
    },
    flora: {
      outline: 'M7 3h10v2H7zM5 6h14v15H5zm4 9l2 2 4-4',
      filled: 'M7 3h10v2H7zM4 6h16v15H4zm6 10l-2-2-1.5 1.5L10 17l7-7-1.5-1.5z'
    },
    acero: {
      outline: 'M6 3h12v2H6zM4 6h16v15H4zm5 9l2 2 5-5',
      filled: 'M6 3h12v2H6zM3 6h18v15H3zm7 10l-2-2-1.5 1.5L10 17l7-7-1.5-1.5z'
    },
    'flora.rosas': {
      outline: 'M7 4h10v2H7zM5 7h14v13H5zm4 5l2 2 4-4',
      filled: 'M7 4h10v2H7zM4 7h16v14H4zm5 5l2 2 4-4-2-2-4 4z'
    },
    'flora.corazones': {
      outline: 'M8 4h8v2H8zM5 7h14v13H5zm4 5l2 2 3-3',
      filled: 'M8 4h8v2H8zM4 7h16v14H4zm5 5l2 2 3-3-2-2-3 3z'
    },
    'flora.kawaii': {
      outline: 'M9 5h6v1H9zM6 8h12v11H6zm4 4h4v2h-4zM8 14h8',
      filled: 'M9 5h6v1H9zM5 8h14v12H5zm4 4h4v1H9zM7 14h10v1H7z'
    },
    'acero.guerra': {
      outline: 'M6 3h12v3H6zM4 8h16v13H4zm4 4l3-3 3 3-3 3z',
      filled: 'M6 3h12v2H6zM3 8h18v14H3zm5 4l3-3 3 3-3 3z'
    },
    'acero.deporte': {
      outline: 'M7 4h10v2H7zM5 7h14v12H5zm5 4l2 2 3-3',
      filled: 'M7 4h10v2H7zM4 7h16v13H4zm6 4l2 2 3-3-2-2-3 3z'
    },
    'acero.tech': {
      outline: 'M7 4h10v2H7zM4 7h16v13H4zm4 5l3-3 3 3-3 3z',
      filled: 'M7 4h10v2H7zM3 7h18v14H3zm5 5l3-3 3 3-3 3z'
    }
  },

  /* ———— DASHBOARD (line chart) ———— */
  dashboard: {
    clasico: {
      outline: 'M4 18h16M6 16l4-8 4 5 4-9',
      filled: 'M6 16l4-8 4 5 4-9v11H6z'
    },
    flora: {
      outline: 'M5 17h14M7 15l3-6 4 4 4-7',
      filled: 'M7 15l3-6 4 4 4-7v10H7z'
    },
    acero: {
      outline: 'M3 19h18M5 17l5-9 4 6 5-11',
      filled: 'M5 17l5-9 4 6 5-11v13H5z'
    },
    'flora.rosas': {
      outline: 'M4 18h16M6 16l4-8 4 5 4-9',
      filled: 'M6 16l4-8 4 5 4-9v11H6z'
    },
    'flora.corazones': {
      outline: 'M5 17h14M7 15l3-6 4 4 4-7',
      filled: 'M7 15l3-6 4 4 4-7v10H7z'
    },
    'flora.kawaii': {
      outline: 'M4 18h16M6 15l4-7 4 4 4-8',
      filled: 'M6 15l4-7 4 4 4-8v11H6z'
    },
    'acero.guerra': {
      outline: 'M3 19h18M5 17l5-9 4 6 5-11',
      filled: 'M5 17l5-9 4 6 5-11v13H5z'
    },
    'acero.deporte': {
      outline: 'M4 18h16M6 16l4-8 4 5 4-9',
      filled: 'M6 16l4-8 4 5 4-9v11H6z'
    },
    'acero.tech': {
      outline: 'M4 18h16M6 15l4-6 4 3 4-7',
      filled: 'M6 15l4-6 4 3 4-7v12H6z'
    }
  },

  /* ———— UTILITY ICONS ———— */
  recurring: {
    clasico: 'M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z',
    flora: 'M12 4v3l-4-3 4-3v3a7 7 0 11-7 7H3a8 8 0 109-8zm-1 8h3l-2 3-2-3h3',
    acero: 'M12 2v4l-4-4 4-4v4a8 8 0 11-8 8H2a10 10 0 1010-10z',
    'flora.rosas': 'M12 4v3l-4-3 4-3v3a7 7 0 11-7 7H2a9 9 0 1010-9zm-2 7h4l-2 3-2-3z',
    'flora.corazones': 'M12 3v5l-4-3 4-3v3a7 7 0 11-7 7H2a9 9 0 1010-9zm-1 7h3l-1.5 2z',
    'flora.kawaii': 'M12 5v3l-3-2 3-2v2a6 6 0 11-6 6H5a7 7 0 107-7z',
    'acero.guerra': 'M12 2v5l-5-4 5-4v4a9 9 0 11-9 9H2a11 11 0 1011-11z',
    'acero.deporte': 'M12 3v4l-4-3 4-3v3a7 7 0 11-7 7H3a9 9 0 1010-9z',
    'acero.tech': 'M12 2v4l-4-4 4-4v4a8 8 0 11-8 8H2a10 10 0 1010-10zM9 11h6l-3 4z'
  },
  streak: {
    clasico: 'M12 2L5 12h3l-2 10h12l-2-10h3z',
    flora: 'M12 3c-2 3-4 5-4 8 0 3 2 5 4 5s4-2 4-5c0-3-2-5-4-8z',
    acero: 'M12 1L5 13h4l-3 11h12l-3-11h4z',
    'flora.rosas': 'M12 4c-2 3-3 5-3 7 0 3 1 5 3 6 2-1 3-3 3-6 0-2-1-4-3-7z',
    'flora.corazones': 'M12 3c-2 3-3 5-3 7 0 3 2 5 3 6 1-1 3-3 3-6 0-2-1-4-3-7z',
    'flora.kawaii': 'M12 5c-2 2-3 4-3 6 0 2 1 3 3 4 2-1 3-2 3-4 0-2-1-4-3-6z',
    'acero.guerra': 'M12 2L5 12h4l-3 10h12l-3-10h4zM12 6v4l2 2',
    'acero.deporte': 'M12 3c-2 3-4 5-4 8 0 2 2 4 4 5 2-1 4-3 4-5 0-3-2-5-4-8z',
    'acero.tech': 'M12 1L5 12h4l-3 10h12l-3-10h4zM12 4v5l3 2'
  },
  empty: {
    clasico: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2zm0-4h-2V7h2z',
    flora: 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm1 13h-2v-2h2zm0-4h-2V8h2z',
    acero: 'M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z',
    'flora.rosas': 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm1 13h-2v-2h2zm0-4h-2V8h2z',
    'flora.corazones': 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm1 13h-2v-2h2zm0-4h-2V8h2z',
    'flora.kawaii': 'M12 4C8 4 4 7 4 12s4 8 8 8 8-4 8-8-4-8-8-8zm1 12h-2v-2h2zm0-4h-2V9h2z',
    'acero.guerra': 'M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 14h-1v-2h1zm0-4h-1V7h1z',
    'acero.deporte': 'M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z',
    'acero.tech': 'M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z'
  },
  check: {
    clasico: 'M5 13l4 4L19 7',
    flora: 'M6 14l3.5 3.5L18 8',
    acero: 'M4 12l5 5L20 6',
    'flora.rosas': 'M6 13l3 4L18 8',
    'flora.corazones': 'M5 12l4 5L19 7',
    'flora.kawaii': 'M7 13l3 3L17 9',
    'acero.guerra': 'M4 11l5 6L20 5',
    'acero.deporte': 'M6 12l4 4L18 7',
    'acero.tech': 'M5 12l4 5L19 6'
  },
  close: {
    clasico: 'M6 18L18 6M6 6l12 12',
    flora: 'M7 17l10-10M7 7l10 10',
    acero: 'M5 5l14 14M19 5L5 19',
    'flora.rosas': 'M7 17l10-10M7 7l10 10',
    'flora.corazones': 'M6 18L18 6M6 6l12 12',
    'flora.kawaii': 'M8 16l8-8M8 8l8 8',
    'acero.guerra': 'M4 5l16 16M20 5L4 21',
    'acero.deporte': 'M6 17l10-10M7 7l10 10',
    'acero.tech': 'M5 5l14 14M19 5L5 19'
  },
  sun: {
    clasico: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    flora: 'M12 4V3m0 18v-1m9-9h-1M4 12H3m14.5-6.5L17 6m-10 0l-.5-.5m10 11l-.5-.5M7 17l-.5.5M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    acero: 'M12 2v2m0 16v2m10-10h-2M4 12H2m16.5-6.5L17 6.8M7 6.8L5.5 5.3m13 13.4L17 17.2M7 17.2l-1.5 1.5M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    'flora.rosas': 'M12 4V3m0 18v-1m9-9h-1M4 12H3M16 12a4 4 0 11-8 0 4 4 0 018 0zM8 8l8 8',
    'flora.corazones': 'M12 5V3m0 18v-2m9-7h-2M4 12H2M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    'flora.kawaii': 'M12 4v1m0 16v1m7-9h-1M5 12H4M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'acero.guerra': 'M12 2v3m0 18v-3m10-7h-3M2 12h3M17 7l2-2M5 17l-2 2m16 0l-2-2M5 7l-2-2M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'acero.deporte': 'M12 3v2m0 18v-2m9-7h-2M4 12H2M17 7l2-2M5 17l-2 2m16 0l-2-2M5 7l-2-2M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'acero.tech': 'M12 2v2m0 18v-2m10-8h-2M4 12H2M16.5 5.5L18 4M5.5 16.5L4 18m14.5 0L17 16.5M7.5 5.5L6 4M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  },
  moon: {
    clasico: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    flora: 'M21 15.5A9.5 9.5 0 018.5 3 9.5 9.5 0 1021 15.5z',
    acero: 'M21 14.5A9 9 0 019.5 3 9 9 0 1021 14.5z',
    'flora.rosas': 'M21 15.5A9.5 9.5 0 018.5 3 9.5 9.5 0 1021 15.5z',
    'flora.corazones': 'M19 15a7 7 0 01-10-10A8 8 0 1019 15z',
    'flora.kawaii': 'M18 14a6 6 0 01-8-8A7 7 0 1018 14z',
    'acero.guerra': 'M20 14a8 8 0 01-9-9 9 9 0 1011 11zM10 8l2-2',
    'acero.deporte': 'M19 15a7 7 0 01-10-10A8 8 0 1019 15z',
    'acero.tech': 'M21 14.5A9 9 0 019.5 3 9 9 0 1021 14.5zM11 6l1-1'
  },
  gear: {
    clasico: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    flora: 'M12 3c-.8 0-1.5.5-1.8 1.2l-.5 1.2c-.3 0-.6.1-.9.2l-1.2-.6c-.7-.3-1.5 0-1.8.7l-.8 1.4c-.3.7 0 1.5.7 1.8l1.1.5c0 .3-.1.6-.1.9l-.6 1.2c-.3.7 0 1.5.7 1.8l1.4.8c.7.3 1.5 0 1.8-.7l.5-1.1c.3 0 .6.1.9.1l1.2.6c.7.3 1.5 0 1.8-.7l.8-1.4c.3-.7 0-1.5-.7-1.8l-1.1-.5v-.9l.6-1.2c.3-.7 0-1.5-.7-1.8l-1.4-.8c-.3-.2-.7-.2-1-.2zM12 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
    acero: 'M12 2l2 3h5l1 4-3 3 3 3-1 4h-5l-2 3-2-3H5l-1-4 3-3-3-3 1-4h5zM12 9a3 3 0 100 6 3 3 0 000-6z',
    'flora.rosas': 'M12 3c-.8 0-1.5.5-1.8 1.2l-.5 1.2c-.3 0-.6.1-.9.2l-1.2-.6c-.7-.3-1.5 0-1.8.7l-.8 1.4c-.3.7 0 1.5.7 1.8l1.1.5c0 .3-.1.6-.1.9l-.6 1.2c-.3.7 0 1.5.7 1.8l1.4.8c.7.3 1.5 0 1.8-.7l.5-1.1c.3 0 .6.1.9.1l1.2.6c.7.3 1.5 0 1.8-.7l.8-1.4c.3-.7 0-1.5-.7-1.8l-1.1-.5v-.9l.6-1.2c.3-.7 0-1.5-.7-1.8l-1.4-.8c-.3-.2-.7-.2-1-.2zM12 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
    'flora.corazones': 'M12 3c-.8 0-1.5.5-1.8 1.2l-.5 1.2c-.3 0-.6.1-.9.2l-1.2-.6c-.7-.3-1.5 0-1.8.7l-.8 1.4c-.3.7 0 1.5.7 1.8l1.1.5c0 .3-.1.6-.1.9l-.6 1.2c-.3.7 0 1.5.7 1.8l1.4.8c.7.3 1.5 0 1.8-.7l.5-1.1c.3 0 .6.1.9.1l1.2.6c.7.3 1.5 0 1.8-.7l.8-1.4c.3-.7 0-1.5-.7-1.8l-1.1-.5v-.9l.6-1.2c.3-.7 0-1.5-.7-1.8l-1.4-.8c-.3-.2-.7-.2-1-.2zM12 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
    'flora.kawaii': 'M12 4c-.7 0-1.3.4-1.5 1l-.4 1c-.2 0-.5.1-.7.2l-1-.5c-.6-.3-1.3 0-1.5.6l-.6 1c-.3.6 0 1.3.6 1.5l.9.5c0 .2-.1.5-.1.7l-.5 1c-.3.6 0 1.3.6 1.5l1 .7c.6.3 1.3 0 1.5-.6l.5-.9c.2 0 .5.1.7.1l1 .5c.6.3 1.3 0 1.5-.6l.6-1c.3-.6 0-1.3-.6-1.5l-.9-.5v-.7l.5-1c.3-.6 0-1.3-.6-1.5l-1-.6c-.2-.2-.6-.2-.9-.2zM12 10c.7 0 1.3.6 1.3 1.3S12.7 12.7 12 12.7s-1.3-.6-1.3-1.3.6-1.4 1.3-1.4z',
    'acero.guerra': 'M12 2l2 3h5l1 4-3 3 3 3-1 4h-5l-2 3-2-3H5l-1-4 3-3-3-3 1-4h5zM12 9a3 3 0 100 6 3 3 0 000-6z',
    'acero.deporte': 'M12 2l2 3h5l1 4-3 3 3 3-1 4h-5l-2 3-2-3H5l-1-4 3-3-3-3 1-4h5zM12 9a3 3 0 100 6 3 3 0 000-6z',
    'acero.tech': 'M12 2l2 3h5l1 4-3 3 3 3-1 4h-5l-2 3-2-3H5l-1-4 3-3-3-3 1-4h5zM12 9a3 3 0 100 6 3 3 0 000-6z'
  },

  /* ———— THEME ICONS ———— */
  temaDefault: { clasico: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z', flora: 'M21 13A9 9 0 1111 4a7 7 0 0010 9z', acero: 'M19 14.5A7 7 0 119.5 5 7 7 0 1019 14.5z',
    'flora.rosas': 'M21 13A9 9 0 1111 4a7 7 0 0010 9z', 'flora.corazones': 'M19 13a8 8 0 11-9-9 7 7 0 109 9z', 'flora.kawaii': 'M18 12a7 7 0 11-8-8 6 6 0 108 8z',
    'acero.guerra': 'M20 13a7 7 0 11-8-8 8 8 0 1010 10z', 'acero.deporte': 'M19 14a7 7 0 11-9-9 7 7 0 109 9z', 'acero.tech': 'M19 14.5A7 7 0 119.5 5 7 7 0 1019 14.5z' },
  temaSepia: { clasico: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z', flora: 'M12 5C8 5 5 8 5 12s3 7 7 7 7-3 7-7-3-7-7-7zm0 3v4l3 2', acero: 'M12 4L4 12h3l-2 10h14l-2-10h3z',
    'flora.rosas': 'M12 5C8 5 5 8 5 12s3 7 7 7 7-3 7-7-3-7-7-7zm0 3v4l3 2', 'flora.corazones': 'M12 6c-3 0-6 3-6 6s3 6 6 6 6-3 6-6-3-6-6-6z', 'flora.kawaii': 'M12 7c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5z',
    'acero.guerra': 'M12 3L3 12h4l-2 10h14l-2-10h4z', 'acero.deporte': 'M12 5L5 12h3l-2 9h12l-2-9h3z', 'acero.tech': 'M12 4L4 12h3l-2 10h14l-2-10h3z' },
  temaOcean: { clasico: 'M2 12h2a8 8 0 0116 0h2M8 12a4 4 0 018 0', flora: 'M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10M6 12a6 6 0 0112 0', acero: 'M2 12h3a7 7 0 0114 0h3M7 12a5 5 0 0110 0',
    'flora.rosas': 'M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10M6 12a6 6 0 0112 0', 'flora.corazones': 'M3 12a9 9 0 0018 0M7 12a5 5 0 0110 0', 'flora.kawaii': 'M4 12a8 8 0 0016 0M8 12a4 4 0 018 0',
    'acero.guerra': 'M2 12h3a7 7 0 0114 0h3M6 12a5 5 0 0112 0', 'acero.deporte': 'M2 12h3a7 7 0 0114 0h3M7 12a5 5 0 0110 0', 'acero.tech': 'M2 12h3a7 7 0 0114 0h3M7 12a5 5 0 0110 0' },
  temaMinimal: { clasico: 'M12 2a10 10 0 100 20 10 10 0 000-20z', flora: 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z', acero: 'M12 2l10 10-10 10L2 12z',
    'flora.rosas': 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z', 'flora.corazones': 'M12 4C8 4 4 8 4 12s4 8 8 8 8-4 8-8-4-8-8-8z', 'flora.kawaii': 'M12 5C8 5 5 8 5 12s3 7 7 7 7-3 7-7-3-7-7-7z',
    'acero.guerra': 'M12 2l10 10-10 10L2 12zM12 6l6 6-6 6-6-6z', 'acero.deporte': 'M12 2l10 10-10 10L2 12z', 'acero.tech': 'M12 2l10 10-10 10L2 12z' },

  /* ———— FAMILY ICONS ———— */
  estiloClasico: { clasico: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', flora: 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z', acero: 'M12 2l10 10-10 10L2 12z',
    'flora.rosas': 'M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z', 'flora.corazones': 'M12 4C8 4 4 8 4 12s4 8 8 8 8-4 8-8-4-8-8-8z', 'flora.kawaii': 'M12 5C8 5 5 8 5 12s3 7 7 7 7-3 7-7-3-7-7-7z',
    'acero.guerra': 'M12 2l10 10-10 10L2 12z', 'acero.deporte': 'M12 2l10 10-10 10L2 12z', 'acero.tech': 'M12 2l10 10-10 10L2 12z' },
  estiloFlora: { clasico: 'M12 4c-2 0-4 2-4 4 0 1.1.6 2 1 3-.4 1-1 2-1 3 0 2 2 4 4 4s4-2 4-4c0-1-.6-2-1-3 .4-1 1-1.9 1-3 0-2-2-4-4-4z', flora: 'M12 3c3 0 5 2 5 5 0 1.5-.8 2.8-2 3.5.5 1 .8 2 .8 3.5 0 3-2 5-5 5s-5-2-5-5c0-1.5.3-2.5.8-3.5-1.2-.7-2-2-2-3.5 0-3 2-5 5-5z', acero: 'M12 2L4 8l3 3-3 8 8-3 8 3-3-8 3-3z',
    'flora.rosas': 'M12 3c3 0 5 2 5 5 0 1.5-.8 2.8-2 3.5.5 1 .8 2 .8 3.5 0 3-2 5-5 5s-5-2-5-5c0-1.5.3-2.5.8-3.5-1.2-.7-2-2-2-3.5 0-3 2-5 5-5z', 'flora.corazones': 'M12 4c3 0 5 2 5 4 0 1-.5 2-1.5 3 .5 1 .5 2 .5 3 0 3-2 4-4 4s-4-1-4-4c0-1 0-2 .5-3C6.5 10 6 9 6 8c0-2 2-4 5-4z', 'flora.kawaii': 'M12 5c3 0 4 2 4 4 0 1-.5 2-1.5 2.5.5 1 .5 2 .5 3 0 2-2 3-3 3s-3-1-3-3c0-1 0-2 .5-3C8.5 11 8 10 8 9c0-2 1-4 4-4z',
    'acero.guerra': 'M12 2L4 8l3 3-3 8 8-3 8 3-3-8 3-3z', 'acero.deporte': 'M12 2L4 8l3 3-3 8 8-3 8 3-3-8 3-3z', 'acero.tech': 'M12 2L4 8l3 3-3 8 8-3 8 3-3-8 3-3z' },
  estiloAcero: { clasico: 'M12 2l3 3h5v5l3 3-3 3v5h-5l-3 3-3-3H4v-5l-3-3 3-3V5h5z', flora: 'M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z', acero: 'M12 2l10 10-10 10L2 12z',
    'flora.rosas': 'M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z', 'flora.corazones': 'M12 4c4 0 7 3 7 8s-3 8-7 8-7-3-7-8 3-8 7-8z', 'flora.kawaii': 'M12 5c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z',
    'acero.guerra': 'M12 2l10 10-10 10L2 12z', 'acero.deporte': 'M12 2l10 10-10 10L2 12z', 'acero.tech': 'M12 2l10 10-10 10L2 12z' },

  /* ———— HABIT PRESETS ———— */
  corazon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  estrella: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  ojo: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  rayo: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  nota: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  libro: 'M4 6H2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6h-2m0 14H4V6h16v14zM6 2v4h12V2m-9 7h6v2H9zm0 3h6v2H9z',
  cafe: 'M18 8H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8zm-4 10H6V8h8v10zm4-7h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-2v2h2v2h-2v2zM4 8H2v2h2V8zm0-3H2v2h2V5z',
  lapiz: 'M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  peso: 'M2 17l4-4 4 4 4-4 4 4 4-4 2 2v4H2v-4zM2 7l4 4 4-4 4 4 4-4 4 4 2-2V5H2v2z',
  reloj: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  persona: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  casa: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  energia: 'M7 2v11h3v9l7-12h-4l4-8z',
  agua: 'M12 2C8 6 4 10 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-4-8-8-8zm0 14c-1.1 0-2-.9-2-2 0-1.3 2-4 2-4s2 2.7 2 4c0 1.1-.9 2-2 2z',
  comida: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
  arbol: 'M12 2L8 8h3v4H6l-4 6h20l-4-6h-5V8h3z',
  sol: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2zm-6.36-2.64l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm12.72-12.72l-1.41 1.41 1.41 1.41 1.41-1.41L17.36 5.64zM5.64 5.64L4.22 7.05l1.41 1.41 1.41-1.41L5.64 5.64zm12.72 12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41z'
}

/* ==================== COMPONENT BUILDER ==================== */

function getFamiliaKey(familia, variante) {
  return variante ? `${familia}.${variante}` : familia
}

function lookupPaths(data, familia, variante) {
  const key = getFamiliaKey(familia, variante)
  const exact = data[key]
  if (exact) return exact
  // fall back to family-level
  return data[familia] || null
}

function resolveVariantePath(data, familia, variante) {
  const entry = lookupPaths(data, familia, variante)
  if (!entry) return null
  // If it's a string (shared path), return it
  if (typeof entry === 'string') return entry
  // If it has a 'clasico' key, it's a family-level object with per-fallback
  if (entry.clasico) return entry[familia] || entry.clasico
  return null
}

function makeIcon(name, variant) {
  function Icon({ className, style } = {}) {
    const { familia, variante } = useIconContext()
    const esRelleno = variant === 'filled'
    const data = F[name]
    if (!data) return null

    const raw = lookupPaths(data, familia, variante)
    if (!raw) return null

    const d = typeof raw === 'string' ? raw : raw[variant]

    const props = getSvgProps(familia, variante)

    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        {...(esRelleno ? { fill: 'currentColor' } : {
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: props.strokeWidth,
          strokeLinecap: props.strokeLinecap,
          strokeLinejoin: props.strokeLinejoin
        })}
        style={style}
      >
        <path d={d} />
      </svg>
    )
  }
  return Icon
}

/* ==================== TAB ICONS ==================== */
export const HoyIcon = makeIcon('hoy', 'outline')
export const HoyIconActive = makeIcon('hoy', 'filled')
export const CalendarioIcon = makeIcon('calendario', 'outline')
export const CalendarioIconActive = makeIcon('calendario', 'filled')
export const HabitosIcon = makeIcon('habitos', 'outline')
export const HabitosIconActive = makeIcon('habitos', 'filled')
export const HorarioIcon = makeIcon('horario', 'outline')
export const HorarioIconActive = makeIcon('horario', 'filled')
export const TareasIcon = makeIcon('tareas', 'outline')
export const TareasIconActive = makeIcon('tareas', 'filled')
export const DashboardIcon = makeIcon('dashboard', 'outline')
export const DashboardIconActive = makeIcon('dashboard', 'filled')

/* ==================== UTILITY ICONS ==================== */
function makeUtility(name) {
  function Icon({ className, style } = {}) {
    const { familia, variante } = useIconContext()
    const data = F[name]
    if (!data) return null
    const p = resolveVariantePath(data, familia, variante)
    if (!p) return null
    const props = getSvgProps(familia, variante)
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={props.strokeWidth} strokeLinecap={props.strokeLinecap} strokeLinejoin={props.strokeLinejoin} style={style}>
        <path d={p} />
      </svg>
    )
  }
  return Icon
}

export const RecurringIcon = makeUtility('recurring')
export const StreakIcon = makeUtility('streak')
export const EmptyIcon = makeUtility('empty')
export const CheckIcon = makeUtility('check')
export const CloseIcon = makeUtility('close')
export const SunIcon = makeUtility('sun')
export const MoonIcon = makeUtility('moon')
export const GearIcon = makeUtility('gear')

/* ==================== THEME ICONS ==================== */
function makeThemeIcon(name) {
  function Icon({ className, style } = {}) {
    const { familia, variante } = useIconContext()
    const data = F[name]
    if (!data) return null
    const key = variante ? `${familia}.${variante}` : familia
    const d = data[key] || data[familia] || data.clasico
    const props = getSvgProps(familia, null)
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={props.strokeWidth} strokeLinecap={props.strokeLinecap} strokeLinejoin={props.strokeLinejoin} style={style}>
        <path d={d} />
      </svg>
    )
  }
  return Icon
}

export const TemaDefaultIcon = makeThemeIcon('temaDefault')
export const TemaSepiaIcon = makeThemeIcon('temaSepia')
export const TemaOceanIcon = makeThemeIcon('temaOcean')
export const TemaMinimalIcon = makeThemeIcon('temaMinimal')

export const EstiloClasicoIcon = makeThemeIcon('estiloClasico')
export const EstiloFloraIcon = makeThemeIcon('estiloFlora')
export const EstiloAceroIcon = makeThemeIcon('estiloAcero')

/* ==================== HABIT PRESET ICONS ==================== */
export const HABIT_ICONS = [
  { key: 'corazon', label: 'Corazon' },
  { key: 'estrella', label: 'Estrella' },
  { key: 'ojo', label: 'Ojo' },
  { key: 'rayo', label: 'Rayo' },
  { key: 'nota', label: 'Nota' },
  { key: 'libro', label: 'Libro' },
  { key: 'cafe', label: 'Cafe' },
  { key: 'lapiz', label: 'Lapiz' },
  { key: 'peso', label: 'Peso' },
  { key: 'reloj', label: 'Reloj' },
  { key: 'persona', label: 'Persona' },
  { key: 'casa', label: 'Casa' },
  { key: 'energia', label: 'Energia' },
  { key: 'agua', label: 'Agua' },
  { key: 'comida', label: 'Comida' },
  { key: 'arbol', label: 'Arbol' },
  { key: 'sol', label: 'Sol' }
]

export function HabitPresetIcon({ className, iconKey, style }) {
  const { familia, variante } = useIconContext()
  const d = typeof F[iconKey] === 'object'
    ? resolveVariantePath(F[iconKey], familia, variante)
    : F[iconKey]
  if (!d) return null
  const props = getSvgProps(familia, variante)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={props.strokeWidth} strokeLinecap={props.strokeLinecap} strokeLinejoin={props.strokeLinejoin} style={style}>
      <path d={d} />
    </svg>
  )
}
