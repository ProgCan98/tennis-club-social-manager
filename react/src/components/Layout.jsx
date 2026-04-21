import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

/**
 * Layout
 * Props:
 *   title      (string)      — título que aparece en el topbar
 *   activePage (string)      — nombre de la página activa para highlight en nav
 *   actions    (ReactNode)   — botones/acciones del topbar (opcional)
 *   children   (ReactNode)   — contenido de la página (outlet)
 */
function Layout({ title, activePage, actions, children }) {
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
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="layout">

        <header className="topbar">
          {/* Botón hamburguesa — solo visible en mobile via CSS */}
          <button
            className="topbar__hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
          >
            <span /><span /><span />
          </button>

          <div className="topbar__greeting">
            <h2 className="topbar__title">{title}</h2>
            <p className="topbar__date">{currentDate}</p>
          </div>
          {actions && (
            <div className="topbar__actions">{actions}</div>
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
