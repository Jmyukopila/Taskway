import { CheckIcon } from '../../config/icons'

export default function Checkbox({ checked, onChange, className = '', label }) {
  return (
    <button
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${className}`}
      style={{
        backgroundColor: checked ? 'var(--color-teal)' : 'transparent',
        borderColor: checked ? 'var(--color-teal)' : 'var(--color-muted)'
      }}
    >
      {checked && <CheckIcon className="w-3 h-3" style={{ color: '#fff' }} />}
    </button>
  )
}
