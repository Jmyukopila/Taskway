import { TABS } from '../config/tabs'

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="sticky bottom-0 z-40 border-t"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
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
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-200 relative"
              style={{ color: isActive ? 'var(--color-teal)' : 'var(--color-muted)' }}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-teal)' }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
