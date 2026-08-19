import Modal from './ui/Modal'
import { PlusIcon, CheckIcon, RecurringIcon } from '../config/icons'

/* ==========================================================================
   Ventana de novedades: que ha cambiado desde la ultima version que vio el
   usuario. Se abre sola tras actualizar y tambien a mano desde Configuracion.
   ========================================================================== */

const ESTILO_TIPO = {
  nuevo: { Icono: PlusIcon, etiqueta: 'Nuevo', color: 'var(--color-teal)' },
  arreglado: { Icono: CheckIcon, etiqueta: 'Arreglado', color: 'var(--color-success)' },
  mejorado: { Icono: RecurringIcon, etiqueta: 'Mejorado', color: 'var(--color-purple)' }
}

function formatearFecha(iso) {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export default function NovedadesModal({ entradas, onClose }) {
  if (!entradas || entradas.length === 0) return null

  return (
    <Modal open onClose={onClose} titulo="Novedades">
      <div className="space-y-6">
        {entradas.map(entrada => (
          <section key={entrada.version}>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {entrada.titulo}
              </h3>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 15%, transparent)' }}>
                v{entrada.version}
              </span>
              <span className="text-[11px] ml-auto" style={{ color: 'var(--color-muted)' }}>
                {formatearFecha(entrada.fecha)}
              </span>
            </div>

            <ul className="space-y-2.5">
              {entrada.cambios.map((cambio, i) => {
                const estilo = ESTILO_TIPO[cambio.tipo] || ESTILO_TIPO.mejorado
                const { Icono } = estilo
                return (
                  <li key={i} className="flex gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `color-mix(in srgb, ${estilo.color} 15%, transparent)`, color: estilo.color }}
                      title={estilo.etiqueta}
                      aria-label={estilo.etiqueta}
                    >
                      <Icono className="w-3 h-3" />
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {cambio.texto}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <button
          onClick={onClose}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm active:scale-95"
          style={{ backgroundColor: 'var(--color-teal)' }}
        >
          Entendido
        </button>
      </div>
    </Modal>
  )
}
