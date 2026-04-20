import { useEffect, useRef } from 'react'

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
}

/**
 * Toast
 * Props:
 *   message  (string)   — texto a mostrar
 *   type     (string)   — 'success' | 'error' | 'warning' | 'info'
 *   visible  (bool)     — controla si está visible
 *   onHide   (function) — callback cuando termina el timer (para limpiar estado)
 *   duration (number)   — ms hasta ocultar (default 3000)
 */
function Toast({ message, type = 'success', visible, onHide, duration = 3000 }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onHide?.()
      timerRef.current = null
    }, duration)
    return () => clearTimeout(timerRef.current)
  }, [visible, message, duration, onHide])

  return (
    <div
      className={`toast toast--${type}${visible ? ' toast--visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast__icon">{ICONS[type] ?? ''}</span>
      <span className="toast__message">{message}</span>
    </div>
  )
}

export default Toast
