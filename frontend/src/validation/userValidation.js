// Client-side validation rules. They mirror the backend rules
// (backend/src/validation/userSchemas.js) to give instant feedback,
// but the backend remains the source of truth and validates again.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_PATTERN = /^[A-Za-z0-9]{6,20}$/;
const EMPLOYEE_NUMBER_PATTERN = /^[A-Za-z0-9-]{1,20}$/;

function requiredText(value, label, max) {
  const text = value.trim();
  if (!text) return `${label} es obligatorio`;
  if (text.length > max) return `${label} no puede superar los ${max} caracteres`;
  return null;
}

function matches(value, label, pattern, message) {
  const text = value.trim();
  if (!text) return `${label} es obligatorio`;
  return pattern.test(text) ? null : message;
}

// Each rule receives the raw input value and returns an error message or null.
const rules = {
  firstName: (value) => requiredText(value, 'El nombre', 100),
  lastName: (value) => requiredText(value, 'El apellido', 100),
  documentNumber: (value) =>
    matches(
      value,
      'El documento',
      DOCUMENT_PATTERN,
      'El documento debe tener entre 6 y 20 caracteres alfanuméricos, sin puntos ni espacios',
    ),
  employeeNumber: (value) =>
    matches(
      value,
      'El legajo',
      EMPLOYEE_NUMBER_PATTERN,
      'El legajo debe tener hasta 20 caracteres alfanuméricos o guiones',
    ),
  email: (value) =>
    matches(value, 'El email', EMAIL_PATTERN, 'El email no tiene un formato válido'),
  address: (value) => requiredText(value, 'El domicilio', 255),
};

export function validateUserField(name, value = '') {
  return rules[name](value);
}

// Validates the given fields and returns { fieldName: message } for the invalid ones.
export function validateUserFields(values, fieldNames = Object.keys(values)) {
  const errors = {};
  for (const name of fieldNames) {
    const error = validateUserField(name, values[name]);
    if (error) errors[name] = error;
  }
  return errors;
}
