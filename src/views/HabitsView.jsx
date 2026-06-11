import { useState, useMemo, useRef } from 'react'
import { hoy } from '../lib/dates'
import Modal from '../components/ui/Modal'
import { HABIT_ICONS, HabitPresetIcon, EmptyIcon, StreakIcon } from '../config/icons'

function calcularStreak(completions) {
  const fechas = Object.keys(completions || {}).sort().reverse()
  if (fechas.length === 0) return 0

  let streak = 0
  const today = hoy()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split('T')[0]

  if (fechas[0] !== today && fechas[0] !== yStr) return 0

  const d = new Date(fechas[0] + 'T12:00:00')
  for (const f of fechas) {
    const expected = d.toISOString().split('T')[0]
    if (f === expected) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function HabitsView({ habits, onAdd, onToggle, onDelete, onUpdateHabit }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#1D9E75')
  const [iconKey, setIconKey] = useState('corazon')
  const [menuHabitId, setMenuHabitId] = useState(null)
  const lastTap = useRef({ id: null, time: 0 })

  const today = hoy()

  const stats = useMemo(() => {
    const total = habits.length
    const completadosHoy = habits.filter(h => (h.completations || h.completions)?.[today]).length
    const mejorStreak = Math.max(0, ...habits.map(h => calcularStreak(h.completations || h.completions)))
    return { total, completadosHoy, mejorStreak }
  }, [habits, today])

  const handleAdd = () => {
    if (!nombre.trim()) return
    onAdd({ nombre: nombre.trim(), color, emoji: iconKey })
    setNombre('')
    setIconKey('corazon')
    setColor('#1D9E75')
    setShowAdd(false)
  }

  const handleSaveEdit = () => {
    if (!nombre.trim() || !editingHabit) return
    onUpdateHabit?.(editingHabit.id, { nombre: nombre.trim(), color, emoji: iconKey })
    setEditingHabit(null)
    setNombre('')
    setIconKey('corazon')
    setColor('#1D9E75')
  }

  const openEdit = (h) => {
    setEditingHabit(h)
    setNombre(h.nombre)
    setColor(h.color)
    setIconKey(h.emoji || 'corazon')
    setMenuHabitId(null)
  }

  return (
    <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in-up">
        <div className="rounded-xl p-3 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: 'var(--color-teal)' }}>{stats.total}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>Habitos</p>
        </div>
        <div className="rounded-xl p-3 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: 'var(--color-purple)' }}>{stats.completadosHoy}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>Hoy</p>
        </div>
        <div className="rounded-xl p-3 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-xl font-bold" style={{ color: 'var(--color-warning)' }}>{stats.mejorStreak}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>Mejor racha</p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2 mb-20">
        {habits.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <EmptyIcon className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No hay habitos todavia</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Crea tu primer habito</p>
          </div>
        )}

        {habits.map(h => {
          const completions = h.completations || h.completions || {}
          const completadoHoy = completions[today]
          const streak = calcularStreak(completions)
          const totalCompletions = Object.keys(completions).length

          return (
            <div
              key={h.id}
              className="rounded-xl p-3 border transition-all animate-fade-in-up"
              style={{
                backgroundColor: completadoHoy ? `color-mix(in srgb, ${h.color} 10%, var(--color-card))` : 'var(--color-card)',
                borderColor: completadoHoy ? `${h.color}40` : 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-3" onClick={() => {
                const now = Date.now()
                if (lastTap.current.id === h.id && now - lastTap.current.time < 300) {
                  setMenuHabitId(menuHabitId === h.id ? null : h.id)
                  lastTap.current = { id: null, time: 0 }
                } else {
                  lastTap.current = { id: h.id, time: now }
                }
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(h.id) }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    backgroundColor: completadoHoy ? h.color : 'var(--color-fondo)',
                    border: `2px solid ${completadoHoy ? h.color : 'var(--color-border)'}`
                  }}
                >
                  <HabitPresetIcon iconKey={h.emoji || 'corazon'} className="w-5 h-5" style={{ color: completadoHoy ? '#fff' : 'var(--color-text-secondary)' }} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{h.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StreakIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-teal)' }}>{streak} dias</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>· {totalCompletions} total</span>
                  </div>
                </div>

                {menuHabitId === h.id && (
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuHabitId(null)} />
                    <div className="relative z-50 flex gap-2 p-1.5 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-fondo)', borderColor: 'var(--color-border)' }}>
                      <button
                        onClick={() => openEdit(h)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                        style={{ color: 'var(--color-teal)', backgroundColor: 'color-mix(in srgb, var(--color-teal) 10%, transparent)' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => { onDelete(h.id); setMenuHabitId(null) }}
                        className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                        style={{ color: 'var(--color-danger)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 10%, transparent)' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Heatmap simple */}
      {habits.length > 0 && (
        <div className="mb-20 animate-fade-in-up">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Actividad reciente</h3>
          <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 49 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (48 - i))
                const dateStr = d.toISOString().split('T')[0]
                const completados = habits.filter(h => (h.completations || h.completions)?.[dateStr]).length
                const intensity = completados > 0 ? Math.min(1, completados / habits.length) : 0
                const levels = ['transparent', 'rgba(29,158,117,0.2)', 'rgba(29,158,117,0.4)', 'rgba(29,158,117,0.6)', 'rgba(29,158,117,0.9)']
                const level = Math.floor(intensity * (levels.length - 1))
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{ backgroundColor: levels[level] }}
                    title={dateStr}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setShowAdd(true); setNombre(''); setIconKey('corazon'); setColor('#1D9E75') }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl z-30"
        style={{
          backgroundColor: 'var(--color-teal)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal add */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} titulo="Nuevo habito">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Leer 30 min"
              className="w-full rounded-lg px-3 py-2.5 text-sm border"
              style={{
                backgroundColor: 'var(--color-fondo)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Icono</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(ic => {
                const activo = iconKey === ic.key
                return (
                  <button
                    key={ic.key}
                    onClick={() => setIconKey(ic.key)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: activo ? 'var(--color-teal)' : 'var(--color-fondo)',
                      border: `1px solid ${activo ? 'var(--color-teal)' : 'var(--color-border)'}`
                    }}
                    title={ic.label}
                  >
                    <HabitPresetIcon iconKey={ic.key} className="w-5 h-5" style={{ color: activo ? '#fff' : 'var(--color-text-secondary)' }} />
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Color</label>
            <div className="flex gap-2">
              {['#1D9E75', '#7F77DD', '#E84855', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '3px'
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!nombre.trim()}
            className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-teal)' }}
          >
            Crear habito
          </button>
        </div>
      </Modal>

      {/* Modal edit */}
      <Modal open={!!editingHabit} onClose={() => { setEditingHabit(null); setNombre(''); setIconKey('corazon'); setColor('#1D9E75') }} titulo="Editar habito">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Leer 30 min"
              className="w-full rounded-lg px-3 py-2.5 text-sm border"
              style={{
                backgroundColor: 'var(--color-fondo)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Icono</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(ic => {
                const activo = iconKey === ic.key
                return (
                  <button
                    key={ic.key}
                    onClick={() => setIconKey(ic.key)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: activo ? 'var(--color-teal)' : 'var(--color-fondo)',
                      border: `1px solid ${activo ? 'var(--color-teal)' : 'var(--color-border)'}`
                    }}
                    title={ic.label}
                  >
                    <HabitPresetIcon iconKey={ic.key} className="w-5 h-5" style={{ color: activo ? '#fff' : 'var(--color-text-secondary)' }} />
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Color</label>
            <div className="flex gap-2">
              {['#1D9E75', '#7F77DD', '#E84855', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '3px'
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleSaveEdit}
            disabled={!nombre.trim()}
            className="w-full text-white font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-teal)' }}
          >
            Guardar cambios
          </button>
        </div>
      </Modal>
    </div>
  )
}
