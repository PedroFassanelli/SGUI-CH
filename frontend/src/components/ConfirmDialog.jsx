import { useEffect, useId, useRef } from 'react';

// Modal confirmation built on the native <dialog> element, which handles
// focus trapping and closing with Escape for free.
// It is "controlled": the parent decides whether it is open via the `open` prop.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  isBusy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Syncs the `open` prop with the imperative showModal()/close() API of <dialog>.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancel(event) {
    // Escape key: keep the parent as the single source of truth for `open`.
    event.preventDefault();
    if (!isBusy) onCancel();
  }

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onCancel={handleCancel}>
      <h2 id={titleId} className="dialog__title">
        {title}
      </h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <button type="button" className="button" onClick={onCancel} disabled={isBusy}>
          Cancelar
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
