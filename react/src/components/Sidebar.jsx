import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  const { user, logout } = useAuth()
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

        {/* Usuario y logout al fondo del sidebar */}
        <div className="sidebar__footer">
          {user && <p className="sidebar__user">{user.name ?? user.email}</p>}
          <button className="sidebar__logout" onClick={logout}>
            <span aria-hidden="true">🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
