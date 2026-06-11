const VARIANTS = {
  primary: { bg: 'var(--color-teal)', hover: 'var(--color-teal-hover)', text: '#fff' },
  secondary: { bg: 'transparent', border: 'var(--color-border)', text: 'var(--color-text)' },
  danger: { bg: 'var(--color-danger)', text: '#fff' },
  ghost: { bg: 'transparent', text: 'var(--color-muted)' }
}

export default function Button({ children, variant = 'primary', className = '', disabled, onClick, type = 'button', ...props }) {
  const v = VARIANTS[variant] || VARIANTS.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded-lg transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: v.bg,
        color: v.text,
        border: v.border ? `1px solid ${v.border}` : undefined
      }}
      onMouseEnter={e => v.hover && (e.target.style.backgroundColor = v.hover)}
      onMouseLeave={e => v.bg && (e.target.style.backgroundColor = v.bg)}
      {...props}
    >
      {children}
    </button>
  )
}
