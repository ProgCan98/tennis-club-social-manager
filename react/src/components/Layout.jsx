import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

/**
 * Layout
 * Props:
 *   title      (string)      — título que aparece en el topbar
 *   activePage (string)      — nombre de la página activa para highlight en nav
 *   actions    (ReactNode)   — botones/acciones del topbar (opcional)
 *   children   (ReactNode)   — contenido de la página (outlet)
 */
function Layout({ title, activePage, actions, children }) {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const isViewer = user?.role === 'viewer'
  const [currentDate,  setCurrentDate]  = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    )
  }, [])

  // Cierra el sidebar al redimensionar a desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    const handler = (e) => { if (e.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <>
      {!isViewer && (
        <Sidebar
          activePage={activePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className={`layout${isViewer ? ' layout--viewer' : ''}`}>

        <header className="topbar">
          {/* Botón hamburguesa — solo visible en mobile via CSS, solo para admin */}
          {!isViewer && (
            <button
              className="topbar__hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
            >
              <span /><span /><span />
            </button>
          )}

          <div className="topbar__greeting">
            {isViewer && (
              <img src="/Logo_mini_MarcaAgua.png" alt="La Falda logo" className="topbar__logo topbar__logo--left" />
            )}
            <div>
              <h2 className="topbar__title">{title}</h2>
              <p className="topbar__date">{currentDate}</p>
            </div>
          </div>

          {actions && (
            <div className="topbar__actions">{actions}</div>
          )}

          {/* Logout en topbar — solo para viewer */}
          {isViewer && (
            <div className="topbar__viewer-controls">
              <span className="topbar__viewer-name">{user?.name ?? user?.email}</span>
              <div className="topbar__viewer-actions">
                <button className="btn--icon-only" onClick={toggleTheme} title={dark ? 'Modo claro' : 'Modo oscuro'}>
                  {dark ? '☀️' : '🌙'}
                </button>
                <button className="btn btn--secondary btn--sm" onClick={logout}>Cerrar sesión</button>
              </div>
            </div>
          )}
        </header>

        <main className="main-content">
          {children}
        </main>

        <footer className="footer">
          <p className="footer__text">Tennis Club Social Manager &copy; 2026</p>
        </footer>

      </div>
    </>
  )
}

export default Layout
