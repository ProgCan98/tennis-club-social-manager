import Modal from './Modal'

/**
 * ConfirmDialog
 * Props:
 *   isOpen    (bool)      — controla visibilidad
 *   title     (string)    — título del modal (default: 'Confirmar')
 *   message   (ReactNode) — cuerpo con la pregunta
 *   confirmLabel (string) — texto del botón de confirmación (default: 'Confirmar')
 *   danger    (bool)      — si true, el botón de confirmación usa btn--danger
 *   onConfirm (function)  — callback al confirmar
 *   onCancel  (function)  — callback al cancelar / cerrar
 */
function ConfirmDialog({
  isOpen,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
      {danger && (
        <p className="form-hint">Esta accion no se puede deshacer.</p>
      )}
    </Modal>
  )
}

export default ConfirmDialog
