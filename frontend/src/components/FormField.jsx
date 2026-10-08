import { useId } from 'react';

// Labeled input with optional hint and error message.
// `aria-invalid` and `aria-describedby` let screen readers announce the
// hint and the error together with the field.
export function FormField({ name, label, hint, error, type = 'text', ...inputProps }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={error ? 'field__input field__input--invalid' : 'field__input'}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
