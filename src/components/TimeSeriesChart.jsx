const PAD = { top: 8, right: 8, bottom: 24, left: 32 }

export default function TimeSeriesChart({ data, height = 160, color = 'var(--color-teal)', fillOpacity = 0.15 }) {
  if (!data || data.length === 0) return null

  const w = 260
  const innerW = w - PAD.left - PAD.right
  const innerH = height - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW / 2

  const points = data.map((d, i) => {
    const x = PAD.left + (data.length > 1 ? i * stepX : i === 0 ? 0 : innerW)
    const y = PAD.top + innerH - (d.value / maxVal) * innerH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('')

  const areaPath = points.length > 1
    ? `${linePath} L${points[points.length - 1].x},${PAD.top + innerH} L${points[0].x},${PAD.top + innerH} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
      {[0.25, 0.5, 0.75].map(f => {
        const y = PAD.top + innerH * (1 - f)
        return (
          <line key={f} x1={PAD.left} y1={y} x2={w - PAD.right} y2={y}
            stroke="var(--color-border)" strokeWidth="0.5" />
        )
      })}

      {areaPath && (
        <path d={areaPath} fill={color} fillOpacity={fillOpacity} />
      )}

      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="var(--color-card)" strokeWidth="1.5" />
      ))}

      {points.filter((_, i) => data.length <= 14 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="8" fill="var(--color-muted)">
          {p.label}
        </text>
      ))}
    </svg>
  )
}
