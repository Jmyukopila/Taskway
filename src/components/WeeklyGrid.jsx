import { DIAS_SEMANA } from '../config/constants'
import { HORARIO_INICIO } from '../config/constants'

const HORAS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`)

function getClasesEnBloque(clases, dia, hora) {
  const hh = parseInt(hora.split(':')[0])
  const bloqueMin = hh * 60
  const bloqueFin = bloqueMin + 60
  return clases.filter(c => {
    if (!c.diasSemana.includes(dia)) return false
    const [ih, im] = c.horaInicio.split(':').map(Number)
    const [fh, fm] = c.horaFin.split(':').map(Number)
    const inicio = ih * 60 + im
    const fin = fh * 60 + fm
    return inicio < bloqueFin && fin > bloqueMin
  })
}

function getBloqueInicio(clase) {
  const [h] = clase.horaInicio.split(':').map(Number)
  return h - HORARIO_INICIO
}

function getDuracion(clase) {
  const [ih, im] = clase.horaInicio.split(':').map(Number)
  const [fh, fm] = clase.horaFin.split(':').map(Number)
  return Math.max(1, Math.round(((fh * 60 + fm) - (ih * 60 + im)) / 60))
}

export default function WeeklyGrid({ clases, onDeleteClass, onAddClick }) {
  if (clases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 empty-state">
        <svg className="w-16 h-16 mb-3" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>No hay clases registradas</p>
        <button onClick={onAddClick} className="mt-3 text-xs font-medium transition-colors"
          style={{ color: 'var(--color-teal)' }}>
          + Agregar clase
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
          {HORAS.map((hora, idx) => {
            const horaNum = idx + HORARIO_INICIO
            return (
              <div key={hora} className="flex">
                <div className="w-12 flex-shrink-0 pt-3">
                  <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>{horaNum}:00</span>
                </div>
                {DIAS_SEMANA.map(dia => {
                  const enBloque = getClasesEnBloque(clases, dia, hora)
                  const principal = enBloque[0]
                  const extra = enBloque.length - 1
                  return (
                    <div key={`${dia}-${hora}`} className="flex-1 h-14 border-t border-l relative"
                      style={{ borderColor: 'var(--color-border)', borderLeftColor: 'color-mix(in srgb, var(--color-border) 30%, transparent)' }}>
                      {principal && getBloqueInicio(principal) === idx && (
                        <div className="absolute inset-0 mx-0.5 rounded-lg z-10 overflow-hidden group cursor-default"
                          style={{
                            backgroundColor: principal.color,
                            height: `${getDuracion(principal) * 3.5 - 0.25}rem`,
                            opacity: 0.9
                          }}>
                          <div className="p-1.5 text-white text-[11px] leading-tight">
                            <div className="font-semibold truncate">{principal.materia}</div>
                            <div className="opacity-80 text-[10px]">
                              {principal.horaInicio}{principal.salon && ` · ${principal.salon}`}
                            </div>
                          </div>
                          <button onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`¿Eliminar "${principal.materia}"?`)) onDeleteClass(principal.id)
                          }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                            ×
                          </button>
                        </div>
                      )}
                      {extra > 0 && getBloqueInicio(principal) === idx && (
                        <div className="absolute -bottom-4 right-1 z-20 text-[9px] font-medium"
                          style={{ color: 'var(--color-muted)' }}>+{extra}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
