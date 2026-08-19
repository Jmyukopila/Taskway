// Derivados de las variables del tema: con colores fijos, los badges se salian
// de la paleta al cambiar de tema o de variante.
const COLORS = {
  alta: { bg: 'color-mix(in srgb, var(--color-purple) 20%, transparent)', text: 'var(--color-purple)' },
  media: { bg: 'color-mix(in srgb, var(--color-teal) 20%, transparent)', text: 'var(--color-teal)' },
  baja: { bg: 'color-mix(in srgb, var(--color-muted) 20%, transparent)', text: 'var(--color-muted)' }
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const c = COLORS[variant] || { bg: 'color-mix(in srgb, var(--color-muted) 20%, transparent)', text: 'var(--color-muted)' }
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </span>
  )
}
