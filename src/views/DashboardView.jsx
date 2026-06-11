import { useState } from 'react'
import useDashboardData from '../hooks/useDashboardData'
import TimeSeriesChart from '../components/TimeSeriesChart'

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
    <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        <KpiCard label="Racha actual" value={data.rachaActual} icon={
          <SvgIcon viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></SvgIcon>
        } />
        <KpiCard label="Completadas" value={data.completadasEnRango} icon={
          <SvgIcon viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></SvgIcon>
        } />
        <KpiCard label="Tasa éxito" value={`${data.tasaExito}%`} icon={
          <SvgIcon viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></SvgIcon>
        } />
        <KpiCard label="Prom. diario" value={data.promedioDiario} icon={
          <SvgIcon viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4" /><path d="M2 20h20" /></SvgIcon>
        } />
        <KpiCard label="Pendientes" value={data.pendientesEnRango} icon={
          <SvgIcon viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12h6M12 9v6" /></SvgIcon>
        } />
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
          <MetricRow label="Racha máxima histórica" value={`${data.rachaMax} días`} />
          <MetricRow label="Total completadas (histórico)" value={data.totalHistorico} />
          <MetricRow label="Tasa global de éxito" value={`${data.tasaExito}%`} />
          <MetricRow label="Hábito con mejor racha" value={data.mejorHabito !== '-' ? `${data.mejorHabito} (${data.rachaMejorHabito}d)` : '-'} />
          <MetricRow label="Días sin completar" value={`${data.diasSinCompletar} en el período`} />

          <div className="pt-1">
            <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Tareas por prioridad</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Alta {data.tasksPorPrioridad.alta}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                Media {data.tasksPorPrioridad.media}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                Baja {data.tasksPorPrioridad.baja}
              </div>
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
                    <span className="font-mono" style={{ color: 'var(--color-muted)' }}>{h.racha} días</span>
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
    <div className="rounded-xl p-2.5 text-center border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="w-5 h-5 mx-auto mb-0.5" style={{ color: 'var(--color-teal)' }}>{icon}</div>
      <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{value}</div>
      <div className="text-[9px] font-medium leading-tight mt-0.5" style={{ color: 'var(--color-muted)' }}>{label}</div>
    </div>
  )
}

function SvgIcon({ viewBox, children }) {
  return (
    <svg viewBox={viewBox} className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
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
    <div className="flex items-center justify-center py-8 text-xs" style={{ color: 'var(--color-muted)' }}>
      Sin datos en este período
    </div>
  )
}
