import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { page: 'dashboard', path: '/',         icon: '📊', label: 'Dashboard'     },
  { page: 'posts',     path: '/posts',     icon: '📝', label: 'Publicaciones' },
  { page: 'ideas',     path: '/ideas',     icon: '💡', label: 'Ideas'         },
  { page: 'calendar',  path: '/calendar',  icon: '📅', label: 'Calendario'    },
]

/**
 * Sidebar
 * Props:
 *   activePage (string)   — clave de la página activa para resaltar el link
 *   isOpen     (bool)     — en mobile: si el drawer está abierto
 *   onClose    (function) — callback para cerrar el drawer
 */
function Sidebar({ activePage, isOpen, onClose }) {
  // Cierra el drawer con Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay oscuro detrás del drawer (solo mobile) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <p className="sidebar__title">Tennis Club</p>
          <p className="sidebar__subtitle">Social Manager</p>
          {/* Botón X para cerrar el drawer en mobile */}
          <button className="sidebar__close" onClick={onClose} aria-label="Cerrar menú">&times;</button>
        </div>
        <nav className="sidebar__nav">
          <ul className="nav__list">
            {NAV_ITEMS.map(item => (
              <li
                key={item.page}
                className={`nav__item${activePage === item.page ? ' nav__item--active' : ''}`}
              >
                <Link className="nav__link" to={item.path} onClick={onClose}>
                  <span className="nav__icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
