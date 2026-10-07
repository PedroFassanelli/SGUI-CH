// Feedback message. Errors use role="alert" so screen readers announce them immediately.
export function Alert({ type = 'info', children, onClose }) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <div className="alert__body">{children}</div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  );
}
