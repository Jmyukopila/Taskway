export default function ClassBlock({ clase, compacto = false, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar "${clase.materia}"?`)) onDelete(clase.id)
  }

  if (compacto) {
    return (
      <div className="rounded-lg px-2 py-1 text-xs font-medium text-white truncate cursor-default group relative"
        style={{ backgroundColor: clase.color }}
        title={`${clase.materia}\n${clase.profesor ? clase.profesor + '\n' : ''}${clase.horaInicio} - ${clase.horaFin}${clase.salon ? '\nSalón ' + clase.salon : ''}`}>
        <span className="block truncate">{clase.materia}</span>
        <span className="block truncate opacity-80 text-[10px]">
          {clase.horaInicio} {clase.salon && `· ${clase.salon}`}
        </span>
        <button onClick={handleDelete}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
          ×
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border group transition-colors"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: clase.color }} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{clase.materia}</h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {clase.horaInicio} - {clase.horaFin}{clase.salon && ` · Salón ${clase.salon}`}{clase.profesor && ` · ${clase.profesor}`}
        </p>
        <p className="text-[11px] mt-0.5 capitalize" style={{ color: 'var(--color-muted)' }}>
          {clase.diasSemana.join(', ')}
        </p>
      </div>
      <button onClick={handleDelete}
        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        style={{ color: 'var(--color-muted)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
