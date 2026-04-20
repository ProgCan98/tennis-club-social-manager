import { useState, useCallback } from 'react'

/**
 * useToast
 * Hook que gestiona el estado del Toast en la página que lo use.
 *
 * Returns:
 *   toast      — { visible, message, type } — props para el componente <Toast>
 *   showToast  — (message, type?) => void — dispara el toast
 *   hideToast  — () => void — lo oculta manualmente (también lo pasa a onHide)
 */
function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  return { toast, showToast, hideToast }
}

export default useToast
