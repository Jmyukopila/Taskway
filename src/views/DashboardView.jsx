import { useState } from 'react'
import useDashboardData from '../hooks/useDashboardData'
import TimeSeriesChart from '../components/TimeSeriesChart'
import { StreakIcon, CheckIcon, DashboardIcon, HabitosIcon, TareasIcon, EmptyIcon } from '../config/icons'

const RANGOS = [
  { key: 7, label: '7 días' },
  { key: 30, label: '30 días' },
  { key: 90, label: '90 días' },
  { key: 365, label: 'Este año' },
  { key: 'all', label: 'Todo' }
]

export default function DashboardView({ tasks, habits }) {
  const [rango, setRango] = useState(7)
  const data = useDashboardData(tasks, habits, rango)

  return (
    <div className="flex-1 px-4 pt-4 pb-8 overflow-y-auto">
      {/* Time filter */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {RANGOS.map(r => (
          <button key={r.key} onClick={() => setRango(r.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: rango === r.key ? 'var(--color-teal)' : 'var(--color-card)',
              color: rango === r.key ? '#fff' : 'var(--color-text)',
              border: `1px solid ${rango === r.key ? 'var(--color-teal)' : 'var(--color-border)'}`
            }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* KPIs: en 480px, cinco columnas dejaban 80px por tarjeta y las etiquetas
          se partian en tres lineas; 3 + 2 respira y se lee de un vistazo. */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <KpiCard label="Racha actual" value={data.rachaActual} icon={<StreakIcon className="w-full h-full" />} />
        <KpiCard label="Completadas" value={data.completadasEnRango} icon={<CheckIcon className="w-full h-full" />} />
        <KpiCard label="Tasa de exito" value={`${data.tasaExito}%`} icon={<DashboardIcon className="w-full h-full" />} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <KpiCard label="Promedio diario" value={data.promedioDiario} icon={<HabitosIcon className="w-full h-full" />} />
        <KpiCard label="Pendientes" value={data.pendientesEnRango} icon={<TareasIcon className="w-full h-full" />} />
      </div>

      {/* Evolución tareas */}
      <Section title={`Evolución — Tareas (${data.rangoLabel})`}>
        {data.tasksChartData.some(d => d.value > 0) ? (
          <TimeSeriesChart data={data.tasksChartData} color="var(--color-teal)" />
        ) : (
          <EmptyChart />
        )}
      </Section>

      {/* Evolución hábitos */}
      <Section title={`Evolución — Hábitos (${data.rangoLabel})`}>
        {data.habitsChartData.some(d => d.value > 0) ? (
          <TimeSeriesChart data={data.habitsChartData} color="var(--color-purple)" />
        ) : (
          <EmptyChart />
        )}
      </Section>

      {/* Más métricas */}
      <Section title="Más métricas">
        <div className="space-y-2.5">
          <MetricRow label="Día más productivo" value={data.diaMasProductivo} />
          <MetricRow label="Racha máxima histórica" value={`${data.rachaMax} ${data.rachaMax === 1 ? 'día' : 'días'}`} />
          <MetricRow label="Total completadas (histórico)" value={data.totalHistorico} />
          <MetricRow label="Tasa global de éxito" value={`${data.tasaGlobal}%`} />
          <MetricRow label="Hábito con mejor racha" value={data.mejorHabito !== '-' ? `${data.mejorHabito} (${data.rachaMejorHabito}d)` : '-'} />
          <MetricRow label="Días sin completar" value={`${data.diasSinCompletar} en el período`} />

          <div className="pt-1">
            <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Tareas por prioridad</p>
            {/* Mismos colores que los badges de prioridad de las tareas */}
            <div className="flex gap-3">
              {[
                { label: 'Alta', valor: data.tasksPorPrioridad.alta, color: 'var(--color-purple)' },
                { label: 'Media', valor: data.tasksPorPrioridad.media, color: 'var(--color-teal)' },
                { label: 'Baja', valor: data.tasksPorPrioridad.baja, color: 'var(--color-muted)' }
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.label} {p.valor}
                </div>
              ))}
            </div>
          </div>

          {/* Rachas de hábitos */}
          {data.rachaPorHabit.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Rachas de hábitos</p>
              <div className="space-y-1">
                {data.rachaPorHabit.map(h => (
                  <div key={h.nombre} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text)' }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="flex-1">{h.nombre}</span>
                    <span className="font-mono" style={{ color: 'var(--color-muted)' }}>{h.racha} {h.racha === 1 ? 'día' : 'días'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

function KpiCard({ label, value, icon }) {
  return (
    <div className="rounded-xl p-3 text-center border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-teal)' }}>{icon}</div>
      <div className="text-lg font-bold leading-none" style={{ color: 'var(--color-text)' }}>{value}</div>
      <div className="text-[10px] font-medium leading-tight mt-1" style={{ color: 'var(--color-muted)' }}>{label}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
        {title}
      </h3>
      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        {children}
      </div>
    </div>
  )
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-xs gap-2" style={{ color: 'var(--color-muted)' }}>
      <EmptyIcon className="w-8 h-8" style={{ opacity: 0.6 }} />
      Sin datos en este período
    </div>
  )
}
