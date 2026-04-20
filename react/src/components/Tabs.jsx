/**
 * Tabs
 * Props:
 *   tabs      (Array<{ value: string, label: string, count?: number }>)
 *   activeTab (string)     — value del tab activo
 *   onChange  (function)   — callback(value) al cambiar tab
 */
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          className={`tab${activeTab === tab.value ? ' tab--active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count != null && (
            <span className="count-badge">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
