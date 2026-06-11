export default function Modal({ open, onClose, children, titulo }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full rounded-t-2xl p-6 animate-slide-up border-t overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          {titulo && <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{titulo}</h2>}
          <button onClick={onClose} className="ml-auto p-1 transition-colors" style={{ color: 'var(--color-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
