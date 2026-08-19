/* eslint-disable react-refresh/only-export-components */
import { useIconContext } from '../contexts/ThemeContext'
import { getSvgProps } from './estilos'
import { getIconSet, ICONOS_FAMILIA } from './iconSets'

/* ==========================================================================
   Capa React del sistema de iconos.

   La geometria vive en iconSets.js: cada familia (clasico / flora / acero)
   dibuja el mismo concepto con su propio lenguaje de formas, y cada variante
   (rosas, corazones, kawaii, guerra, deporte, tech) firma los iconos con su
   motivo. Aqui solo se resuelve el set activo y se pinta.
   ========================================================================== */

function useSet() {
  const { familia, variante, pack } = useIconContext()
  const set = getIconSet(familia, variante, pack)
  const props = pack ? pack.svg : getSvgProps(familia, variante)
  return { set, props }
}

function Svg({ className, style, children }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

function Trazos({ paths, props, className, style }) {
  return (
    <Svg className={className} style={style}>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
        />
      ))}
    </Svg>
  )
}

/* ==================== ICONOS DE PESTAÑA ==================== */

function makeTabIcon(nombre, relleno) {
  function Icon({ className, style }) {
    const { set, props } = useSet()
    const icono = set[nombre]
    if (!icono) return null

    if (!relleno) return <Trazos paths={icono.outline} props={props} className={className} style={style} />

    const { cut, extra } = icono.solid
    return (
      <Svg className={className} style={style}>
        {cut && <path d={cut} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />}
        {extra.map((d, i) => <path key={i} d={d} fill="currentColor" />)}
      </Svg>
    )
  }
  Icon.displayName = `${nombre}${relleno ? 'Activo' : ''}Icon`
  return Icon
}

export const HoyIcon = makeTabIcon('hoy', false)
export const HoyIconActive = makeTabIcon('hoy', true)
export const CalendarioIcon = makeTabIcon('calendario', false)
export const CalendarioIconActive = makeTabIcon('calendario', true)
export const HabitosIcon = makeTabIcon('habitos', false)
export const HabitosIconActive = makeTabIcon('habitos', true)
export const HorarioIcon = makeTabIcon('horario', false)
export const HorarioIconActive = makeTabIcon('horario', true)
export const TareasIcon = makeTabIcon('tareas', false)
export const TareasIconActive = makeTabIcon('tareas', true)
export const DashboardIcon = makeTabIcon('dashboard', false)
export const DashboardIconActive = makeTabIcon('dashboard', true)

/* ==================== ICONOS DE UTILIDAD ==================== */

function makeUtility(nombre) {
  function Icon({ className, style }) {
    const { set, props } = useSet()
    const d = set.utilidades[nombre]
    if (!d) return null
    return <Trazos paths={[d]} props={props} className={className} style={style} />
  }
  Icon.displayName = `${nombre}Icon`
  return Icon
}

export const CheckIcon = makeUtility('check')
export const CloseIcon = makeUtility('close')
export const PlusIcon = makeUtility('mas')
export const ChevronRightIcon = makeUtility('chevronDerecha')
export const ChevronLeftIcon = makeUtility('chevronIzquierda')
export const ChevronDownIcon = makeUtility('chevronAbajo')
export const SearchIcon = makeUtility('buscar')
export const EditIcon = makeUtility('editar')
export const TrashIcon = makeUtility('borrar')
export const BellIcon = makeUtility('campana')
export const DownloadIcon = makeUtility('descargar')
export const UploadIcon = makeUtility('subir')
export const GearIcon = makeUtility('engranaje')
export const SunIcon = makeUtility('sol')
export const MoonIcon = makeUtility('luna')
export const RecurringIcon = makeUtility('recurrente')
export const StreakIcon = makeUtility('racha')
export const EmptyIcon = makeUtility('vacio')
export const MoreIcon = makeUtility('puntos')

/** Reloj: reutiliza la esfera de la familia activa (misma identidad que la pestaña Horario). */
export function ClockIcon({ className, style }) {
  const { set, props } = useSet()
  return <Trazos paths={set.horario.outline} props={props} className={className} style={style} />
}

/* ==================== ICONOS DE TEMA Y FAMILIA ==================== */

function makeThemeIcon(nombre) {
  function Icon({ className, style }) {
    const { set, props } = useSet()
    const d = set.temas[nombre]
    if (!d) return null
    return <Trazos paths={[d]} props={props} className={className} style={style} />
  }
  Icon.displayName = `${nombre}Icon`
  return Icon
}

export const TemaDefaultIcon = makeThemeIcon('temaDefault')
export const TemaSepiaIcon = makeThemeIcon('temaSepia')
export const TemaOceanIcon = makeThemeIcon('temaOcean')
export const TemaMinimalIcon = makeThemeIcon('temaMinimal')

function makeFamiliaIcon(familia) {
  function Icon({ className, style }) {
    const props = getSvgProps(familia, null)
    return <Trazos paths={ICONOS_FAMILIA[familia]} props={props} className={className} style={style} />
  }
  Icon.displayName = `Estilo${familia}Icon`
  return Icon
}

export const EstiloClasicoIcon = makeFamiliaIcon('clasico')
export const EstiloFloraIcon = makeFamiliaIcon('flora')
export const EstiloAceroIcon = makeFamiliaIcon('acero')

/* ==================== ICONOS DE HABITOS ==================== */
/* Pictogramas concretos elegidos por el usuario: no dependen de la variante,
   solo heredan el grosor y el remate de trazo de la familia. */

const PRESETS = {
  corazon: 'M12 20.6l-1.3-1.2C5.6 14.8 2.6 12 2.6 8.6a5 5 0 019-3 5 5 0 019 3c0 3.4-3 6.2-8.1 10.8z',
  estrella: 'M12 3.2l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.8l6.2-.9z',
  ojo: 'M2.2 12S5.8 5.6 12 5.6 21.8 12 21.8 12 18.2 18.4 12 18.4 2.2 12 2.2 12zM12 8.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4z',
  rayo: 'M13.4 2.4L4.6 13.2h5.2l-.8 8.4 9-11H12.4z',
  nota: 'M9.6 18.4V5.2l9.2-2v12M9.6 18.4a2.8 2.8 0 11-5.6 0 2.8 2.8 0 015.6 0zm9.2-3.2a2.8 2.8 0 11-5.6 0 2.8 2.8 0 015.6 0z',
  libro: 'M4 4.4h5.6A2.4 2.4 0 0112 6.8v13a2 2 0 00-2-2H4zm16 0h-5.6A2.4 2.4 0 0012 6.8v13a2 2 0 012-2h6z',
  cafe: 'M4.4 8.4h12v6.4a4.4 4.4 0 01-4.4 4.4H8.8a4.4 4.4 0 01-4.4-4.4zm12 1.6h1.6a2.4 2.4 0 010 4.8h-1.6M7.2 2.8v2.8M11.2 2.8v2.8',
  lapiz: 'M16.8 3.2a2.7 2.7 0 013.8 3.8L8 19.8 2.8 21.2 4.2 16.4z',
  peso: 'M2.4 12h19.2M5.2 8.4v7.2M8 6.8v10.4M16 6.8v10.4M18.8 8.4v7.2',
  reloj: 'M12 3.2a8.8 8.8 0 100 17.6 8.8 8.8 0 000-17.6zM12 7v5.4l3.6 2.2',
  persona: 'M12 3.6a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zM4.4 20.8c0-3.8 3.4-6.4 7.6-6.4s7.6 2.6 7.6 6.4',
  casa: 'M3.6 10.4L12 3.2l8.4 7.2v9.6a1.2 1.2 0 01-1.2 1.2H4.8a1.2 1.2 0 01-1.2-1.2zM9.6 21.2v-6.4h4.8v6.4',
  energia: 'M7.2 2.4h6.4l-2 6.4h4.8l-8 12.8 1.6-8.8H6z',
  agua: 'M12 2.8c3.6 4.4 6.4 7.4 6.4 11a6.4 6.4 0 01-12.8 0c0-3.6 2.8-6.6 6.4-11z',
  comida: 'M5.2 2.8v7.2a2.8 2.8 0 002.8 2.8v8.4M8 2.8v5.6M2.4 2.8v5.6a2.8 2.8 0 002.8 2.8M18.8 2.8c-1.6 2-2.4 4.4-2.4 6.8h4.8V21.2',
  arbol: 'M12 2.8L6.8 10h3.2L5.6 16.4h12.8L14 10h3.2zM12 16.4v4.8',
  sol: 'M12 7.6a4.4 4.4 0 100 8.8 4.4 4.4 0 000-8.8zM12 2.4v2.4M12 19.2v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.4 12h2.4M19.2 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7'
}

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
  const { familia, variante, pack } = useIconContext()
  const props = pack ? pack.svg : getSvgProps(familia, variante)
  const d = PRESETS[iconKey] || PRESETS.corazon
  return <Trazos paths={[d]} props={props} className={className} style={style} />
}
