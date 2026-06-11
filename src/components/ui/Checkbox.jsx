export default function Checkbox({ checked, onChange, className = '' }) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${className}`}
      style={{
        backgroundColor: checked ? 'var(--color-teal)' : 'transparent',
        borderColor: checked ? 'var(--color-teal)' : 'var(--color-muted)'
      }}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
