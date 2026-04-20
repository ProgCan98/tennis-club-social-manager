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
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    )
  }, [])

  return (
    <>
      <Sidebar activePage={activePage} />

      <div className="layout">

        <header className="topbar">
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
