import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  { page: 'dashboard', path: '/',         icon: '📊', label: 'Dashboard'     },
  { page: 'posts',     path: '/posts',     icon: '📝', label: 'Publicaciones' },
  { page: 'ideas',     path: '/ideas',     icon: '💡', label: 'Ideas'         },
  { page: 'calendar',  path: '/calendar',  icon: '📅', label: 'Calendario'    },
]

/**
 * Sidebar
 * Props:
 *   activePage (string) — clave de la página activa para resaltar el link
 */
function Sidebar({ activePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <p className="sidebar__title">Tennis Club</p>
        <p className="sidebar__subtitle">Social Manager</p>
      </div>
      <nav className="sidebar__nav">
        <ul className="nav__list">
          {NAV_ITEMS.map(item => (
            <li
              key={item.page}
              className={`nav__item${activePage === item.page ? ' nav__item--active' : ''}`}
            >
              <Link className="nav__link" to={item.path}>
                <span className="nav__icon" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
