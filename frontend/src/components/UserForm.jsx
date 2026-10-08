import { Link } from 'react-router';
import { FormField } from './FormField.jsx';
import { Alert } from './Alert.jsx';

// UI configuration of each user field (what the HR operator sees).
const FIELD_CONFIG = {
  firstName: { label: 'Nombre', autoComplete: 'given-name', maxLength: 100 },
  lastName: { label: 'Apellido', autoComplete: 'family-name', maxLength: 100 },
  documentNumber: {
    label: 'Documento',
    hint: 'DNI o pasaporte, sin puntos ni espacios.',
    autoComplete: 'off',
    maxLength: 20,
  },
  employeeNumber: {
    label: 'Legajo',
    hint: 'Identificador único del empleado. Ej.: EMP-0005',
    autoComplete: 'off',
    maxLength: 20,
  },
  email: { label: 'Email', type: 'email', autoComplete: 'email', maxLength: 254 },
  address: { label: 'Domicilio', autoComplete: 'street-address', maxLength: 255 },
};

// Renders one input per field in `form.values` (state comes from useUserForm).
// `noValidate` disables the browser's built-in validation bubbles: we show our own messages.
export function UserForm({ form, submitLabel, isSubmitDisabled = false }) {
  const { values, errors, isSubmitting, submitError, handleChange, handleBlur, handleSubmit } =
    form;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="form__grid">
        {Object.keys(values).map((name) => (
          <FormField
            key={name}
            name={name}
            {...FIELD_CONFIG[name]}
            value={values[name]}
            error={errors[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            // readOnly (not disabled): blocks edits while saving but keeps the
            // input focusable, so a server error can move the focus to it.
            readOnly={isSubmitting}
            required
          />
        ))}
      </div>

      <div className="form__actions">
        <Link to="/" className="button">
          Cancelar
        </Link>
        <button
          type="submit"
          className="button button--primary"
          disabled={isSubmitting || isSubmitDisabled}
        >
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
