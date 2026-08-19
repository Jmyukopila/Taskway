import { DIAS_SEMANA, HORARIO_INICIO, HORARIO_FIN } from '../config/constants'
import { CalendarioIcon, CloseIcon, PlusIcon } from '../config/icons'

const HORAS = Array.from(
  { length: HORARIO_FIN - HORARIO_INICIO + 1 },
  (_, i) => `${String(i + HORARIO_INICIO).padStart(2, '0')}:00`
)

const ALTO_BLOQUE_REM = 3.5

function minutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function getClasesEnBloque(clases, dia, hora) {
  const bloqueMin = minutos(hora)
  const bloqueFin = bloqueMin + 60
  return clases.filter(c => {
    if (!c.diasSemana?.includes(dia)) return false
    return minutos(c.horaInicio) < bloqueFin && minutos(c.horaFin) > bloqueMin
  })
}

/** Fila donde se dibuja la clase. Se recorta al rango visible del horario para
 *  que una clase que empieza antes de las 6:00 no desaparezca de la rejilla. */
function getBloqueInicio(clase) {
  const h = Math.floor(minutos(clase.horaInicio) / 60)
  return Math.max(0, h - HORARIO_INICIO)
}

function getDuracion(clase) {
  const inicioVisible = Math.max(minutos(clase.horaInicio), HORARIO_INICIO * 60)
  const finVisible = Math.min(minutos(clase.horaFin), (HORARIO_FIN + 1) * 60)
  return Math.max(1, Math.round((finVisible - inicioVisible) / 60))
}

export default function WeeklyGrid({ clases, onDeleteClass, onAddClick }) {
  if (clases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CalendarioIcon className="w-14 h-14 mb-3" style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
        <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>No hay clases registradas</p>
        <button onClick={onAddClick} className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: 'var(--color-teal)' }}>
          <PlusIcon className="w-3.5 h-3.5" />
          Agregar clase
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[600px]">
        <div className="flex mb-2" style={{ marginLeft: '48px' }}>
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="flex-1 text-center text-[11px] font-medium uppercase tracking-wider py-2"
              style={{ color: 'var(--color-muted)' }}>
              {dia.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="relative">
          {HORAS.map((hora, idx) => (
            <div key={hora} className="flex">
              <div className="w-12 flex-shrink-0 pt-3">
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>{hora}</span>
              </div>
              {DIAS_SEMANA.map(dia => {
                const enBloque = getClasesEnBloque(clases, dia, hora)
                const principal = enBloque[0]
                const dibujarAqui = principal && getBloqueInicio(principal) === idx
                const extra = enBloque.length - 1
                return (
                  <div key={`${dia}-${hora}`} className="flex-1 h-14 border-t border-l relative"
                    style={{ borderColor: 'var(--color-border)', borderLeftColor: 'color-mix(in srgb, var(--color-border) 30%, transparent)' }}>
                    {dibujarAqui && (
                      <div className="absolute inset-0 mx-0.5 rounded-lg z-10 overflow-hidden"
                        style={{
                          backgroundColor: principal.color,
                          height: `${getDuracion(principal) * ALTO_BLOQUE_REM - 0.25}rem`,
                          opacity: 0.9
                        }}>
                        <div className="p-1.5 pr-5 text-white text-[11px] leading-tight">
                          <div className="font-semibold truncate">{principal.materia}</div>
                          <div className="opacity-80 text-[10px] truncate">
                            {principal.horaInicio}{principal.salon && ` · ${principal.salon}`}
                          </div>
                        </div>
                        {/* Visible siempre: en tactil no existe el hover */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${principal.materia}"?`)) onDeleteClass(principal.id)
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/35 text-white flex items-center justify-center transition-opacity opacity-70 hover:opacity-100"
                          aria-label={`Eliminar ${principal.materia}`}
                        >
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {dibujarAqui && extra > 0 && (
                      <div className="absolute bottom-0.5 right-1 z-20 text-[9px] font-medium px-1 rounded"
                        style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-card)' }}>+{extra}</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
