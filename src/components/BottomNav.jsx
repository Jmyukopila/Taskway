import { TABS } from '../config/tabs'

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Navegacion principal"
      className="theme-nav sticky bottom-0 z-40 border-t"
      style={{
        backgroundColor: 'var(--ui-calendar-surface)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)'
      }}
    >
      <div className="flex max-w-[480px] mx-auto">
        {TABS.map(tab => {
          const isActive = tab.key === activeTab
          const Icon = isActive ? tab.iconActive : tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className="theme-nav-tab flex-1 flex flex-col items-center gap-1 py-2 relative"
              style={{ color: isActive ? 'var(--ui-icon)' : 'var(--ui-icon-muted)' }}
            >
              <span className="theme-nav-icon">
                <Icon className="w-6 h-6" />
              </span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
