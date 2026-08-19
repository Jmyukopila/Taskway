import { useState, useMemo } from 'react'
import { hoy, aFecha } from '../lib/dates'
import { calcularRacha } from '../lib/streaks'
import Modal from '../components/ui/Modal'
import { HABIT_ICONS, HabitPresetIcon, EmptyIcon, StreakIcon, PlusIcon, EditIcon, TrashIcon, MoreIcon } from '../config/icons'
import { COLORES_CLASE } from '../config/constants'

const COLORES = COLORES_CLASE.slice(0, 8)
const DIAS_ABR = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function calcularStreak(completions) {
  const marcas = completions || {}
  return calcularRacha(fecha => !!marcas[fecha])
}

function HabitFormModal({ open, onClose, onSubmit, titulo, textoBoton, inicial }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [color, setColor] = useState(inicial?.color || COLORES[0])
  const [iconKey, setIconKey] = useState(inicial?.emoji || 'corazon')

  const guardar = () => {
    if (!nombre.trim()) return
    onSubmit({ nombre: nombre.trim(), color, emoji: iconKey })
  }

  return (
    <Modal open={open} onClose={onClose} titulo={titulo}>
      <div className="space-y-4">
        <div>
          <label htmlFor="habito-nombre" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nombre</label>
          <input
            id="habito-nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') guardar() }}
            placeholder="Ej: Leer 30 min"
            className="w-full rounded-lg px-3 py-2.5 text-sm border"
            style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            autoFocus
          />
        </div>

        <div>
          <span className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Icono</span>
          <div className="flex flex-wrap gap-2">
            {HABIT_ICONS.map(ic => {
              const activo = iconKey === ic.key
              return (
                <button
                  key={ic.key}
                  type="button"
                  onClick={() => setIconKey(ic.key)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: activo ? 'var(--color-teal)' : 'var(--color-fondo)',
                    border: `1px solid ${activo ? 'var(--color-teal)' : 'var(--color-border)'}`
                  }}
                  title={ic.label}
                  aria-label={ic.label}
                  aria-pressed={activo}
                >
                  <HabitPresetIcon iconKey={ic.key} className="w-5 h-5" style={{ color: activo ? '#fff' : 'var(--color-text-secondary)' }} />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Color</span>
          <div className="flex flex-wrap gap-2">
            {COLORES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all"
                style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: '3px' }}
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </div>

        <button
          onClick={guardar}
          disabled={!nombre.trim()}
          className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-teal)' }}
        >
          {textoBoton}
        </button>
      </div>
    </Modal>
  )
}

export default function HabitsView({ habits, onAdd, onToggle, onDelete, onUpdateHabit }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [menuHabitId, setMenuHabitId] = useState(null)

  const today = hoy()

  const stats = useMemo(() => ({
    total: habits.length,
    completadosHoy: habits.filter(h => h.completions?.[today]).length,
    mejorStreak: Math.max(0, ...habits.map(h => calcularStreak(h.completions)))
  }), [habits, today])

  // 7 semanas alineadas a la columna del dia: cada columna es siempre el mismo
  // dia de la semana, que es lo que hace legible un heatmap.
  const dias = useMemo(() => {
    const hoyDate = new Date()
    const diaLunes0 = (hoyDate.getDay() + 6) % 7
    const fin = new Date(hoyDate)
    fin.setDate(fin.getDate() + (6 - diaLunes0))
    return Array.from({ length: 49 }, (_, i) => {
      const d = new Date(fin)
      d.setDate(d.getDate() - (48 - i))
      return aFecha(d)
    })
  }, [])

  return (
    <div className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in-up">
        {[
          { valor: stats.total, label: 'Habitos', color: 'var(--color-teal)' },
          { valor: stats.completadosHoy, label: 'Hoy', color: 'var(--color-purple)' },
          { valor: stats.mejorStreak, label: 'Mejor racha', color: 'var(--color-warning)' }
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.valor}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2 mb-6">
        {habits.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <EmptyIcon className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No hay habitos todavia</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Crea tu primer habito</p>
          </div>
        )}

        {habits.map(h => {
          const completions = h.completions || {}
          const completadoHoy = !!completions[today]
          const streak = calcularStreak(completions)
          const totalCompletions = Object.keys(completions).length
          const menuAbierto = menuHabitId === h.id

          return (
            <div
              key={h.id}
              className="rounded-xl p-3 border transition-all animate-fade-in-up"
              style={{
                backgroundColor: completadoHoy ? `color-mix(in srgb, ${h.color} 10%, var(--color-card))` : 'var(--color-card)',
                borderColor: completadoHoy ? `color-mix(in srgb, ${h.color} 45%, transparent)` : 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(h.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                  style={{
                    backgroundColor: completadoHoy ? h.color : 'var(--color-fondo)',
                    border: `2px solid ${completadoHoy ? h.color : 'var(--color-border)'}`
                  }}
                  aria-pressed={completadoHoy}
                  aria-label={`${completadoHoy ? 'Desmarcar' : 'Marcar'} ${h.nombre} hoy`}
                >
                  <HabitPresetIcon iconKey={h.emoji || 'corazon'} className="w-5 h-5" style={{ color: completadoHoy ? '#fff' : 'var(--color-text-secondary)' }} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{h.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StreakIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-teal)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-teal)' }}>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>· {totalCompletions} total</span>
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setMenuHabitId(menuAbierto ? null : h.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--color-muted)' }}
                    aria-label={`Acciones de ${h.nombre}`}
                    aria-expanded={menuAbierto}
                  >
                    <MoreIcon className="w-4 h-4" />
                  </button>

                  {menuAbierto && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuHabitId(null)} />
                      <div className="absolute right-0 top-full mt-1 z-50 flex gap-2 p-1.5 rounded-lg border shadow-xl"
                        style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => { setEditingHabit(h); setMenuHabitId(null) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 whitespace-nowrap"
                          style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 10%, transparent)' }}
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => { onDelete(h.id); setMenuHabitId(null) }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                          style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                          aria-label={`Eliminar ${h.nombre}`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Heatmap de las ultimas 7 semanas */}
      {habits.length > 0 && (
        <div className="animate-fade-in-up">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Actividad reciente</h3>
          <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="mx-auto" style={{ maxWidth: '17rem' }}>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DIAS_ABR.map((d, i) => (
                  <span key={i} className="text-[9px] text-center" style={{ color: 'var(--color-muted)' }}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dias.map(dateStr => {
                  const futuro = dateStr > today
                  const completados = habits.filter(h => h.completions?.[dateStr]).length
                  const ratio = habits.length > 0 ? completados / habits.length : 0
                  const nivel = completados === 0 ? 0 : Math.max(1, Math.ceil(ratio * 4))
                  return (
                    <div
                      key={dateStr}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: nivel === 0
                          ? 'var(--color-fondo)'
                          : `color-mix(in srgb, var(--color-teal) ${nivel * 25}%, transparent)`,
                        opacity: futuro ? 0.35 : 1,
                        outline: dateStr === today ? '1px solid var(--color-teal)' : 'none'
                      }}
                      title={futuro ? dateStr : `${dateStr}: ${completados} de ${habits.length}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl z-30"
        style={{
          backgroundColor: 'var(--color-teal)',
          color: '#fff',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
        }}
        aria-label="Nuevo habito"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {showAdd && (
        <HabitFormModal
          open
          titulo="Nuevo habito"
          textoBoton="Crear habito"
          onClose={() => setShowAdd(false)}
          onSubmit={(data) => { onAdd(data); setShowAdd(false) }}
        />
      )}

      {editingHabit && (
        <HabitFormModal
          open
          key={editingHabit.id}
          titulo="Editar habito"
          textoBoton="Guardar cambios"
          inicial={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSubmit={(data) => { onUpdateHabit?.(editingHabit.id, data); setEditingHabit(null) }}
        />
      )}
    </div>
  )
}
