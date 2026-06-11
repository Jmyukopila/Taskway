const COLORS = {
  alta: { bg: 'rgba(127, 119, 221, 0.2)', text: 'var(--color-purple)' },
  media: { bg: 'rgba(29, 158, 117, 0.2)', text: 'var(--color-teal)' },
  baja: { bg: 'rgba(74, 85, 104, 0.2)', text: 'var(--color-muted)' }
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const c = COLORS[variant] || { bg: 'rgba(107, 114, 128, 0.2)', text: 'var(--color-muted)' }
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </span>
  )
}
