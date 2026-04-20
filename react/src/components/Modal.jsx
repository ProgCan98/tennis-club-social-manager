import { useEffect } from 'react'

/**
 * Modal
 * Props:
 *   isOpen   (bool)       — controla visibilidad
 *   title    (string)     — título del header
 *   onClose  (function)   — callback al cerrar (X, overlay, Escape)
 *   footer   (ReactNode)  — contenido del pie (botones de acción)
 *   children (ReactNode)  — contenido del cuerpo
 */
function Modal({ isOpen, title, onClose, footer, children }) {
  // Bloquea scroll del body y escucha Escape mientras está abierto
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal modal--open" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__body">
        <div className="modal__header">
          <h3 className="modal__title" id="modal-title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">&times;</button>
        </div>
        <div className="modal__content">
          {children}
        </div>
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
