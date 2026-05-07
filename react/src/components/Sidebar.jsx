import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = [
  { page: 'dashboard', path: '/',         icon: '📊', label: 'Dashboard',     roles: ['admin'] },
  { page: 'posts',     path: '/posts',     icon: '📝', label: 'Publicaciones', roles: ['admin'] },
  { page: 'ideas',     path: '/ideas',     icon: '💡', label: 'Ideas',         roles: ['admin'] },
  { page: 'calendar',  path: '/calendar',  icon: '📅', label: 'Calendario',    roles: ['admin', 'viewer'] },
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
  const { dark, toggleTheme } = useTheme()
  const role = user?.role ?? 'viewer'
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
          <img src="/Logo_mini.png" alt="Tennis Club logo" className="sidebar__logo" />
          <p className="sidebar__title">Tennis Club</p>
          <p className="sidebar__subtitle">Social Manager</p>
          {/* Botón X para cerrar el drawer en mobile */}
          <button className="sidebar__close" onClick={onClose} aria-label="Cerrar menú">&times;</button>
        </div>
        <nav className="sidebar__nav">
          <ul className="nav__list">
            {NAV_ITEMS.filter(item => item.roles.includes(role)).map(item => (
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
          {user && (
            <p className="sidebar__user">
              {user.name ?? user.email}
              {role === 'viewer' && <span className="sidebar__role-badge">Visor</span>}
            </p>
          )}
          <button className="sidebar__theme-btn" onClick={toggleTheme}>
            <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button className="sidebar__logout" onClick={logout}>
            <span aria-hidden="true">🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
