import { useState } from 'react';
import { validateUserField, validateUserFields } from '../validation/userValidation.js';

// Form state shared by the create and edit screens.
// The fields of the form are the keys of `initialValues`.
//
// UX rules:
// - A field shows its error after the user leaves it (blur), not while typing the first time.
// - Once a field was visited, it is re-validated on every keystroke, so the error
//   disappears as soon as it is fixed.
// - On submit, every field is validated and the first invalid one gets the focus.
// - Errors returned by the API (400/409) are shown under the matching field.
export function useUserForm({ initialValues, onSubmit }) {
  const fieldNames = Object.keys(initialValues);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isDirty = fieldNames.some((name) => values[name] !== initialValues[name]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (touched[name]) {
      setErrors((current) => withFieldError(current, name, validateUserField(name, value)));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => withFieldError(current, name, validateUserField(name, value)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateUserFields(values, fieldNames);
    setTouched(Object.fromEntries(fieldNames.map((name) => [name, true])));
    setErrors(validationErrors);
    setSubmitError(null);

    if (focusFirstInvalid(formElement, fieldNames, validationErrors)) return;

    setIsSubmitting(true);
    try {
      // On success the page navigates away, so there is no state to reset here.
      await onSubmit(values);
    } catch (error) {
      const serverErrors = toFieldErrors(error, fieldNames);
      if (focusFirstInvalid(formElement, fieldNames, serverErrors)) {
        setErrors(serverErrors);
      } else {
        setSubmitError(error.message);
      }
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}

function withFieldError(errors, name, error) {
  const { [name]: _previous, ...rest } = errors;
  return error ? { ...rest, [name]: error } : rest;
}

// Maps the API error details ({ field, message }) to the form's fields.
function toFieldErrors(error, fieldNames) {
  const fieldErrors = {};
  for (const { field, message } of error.details ?? []) {
    if (fieldNames.includes(field)) fieldErrors[field] = message;
  }
  return fieldErrors;
}

// Returns true if there was an invalid field (and focuses it).
function focusFirstInvalid(formElement, fieldNames, errors) {
  const firstInvalid = fieldNames.find((name) => errors[name]);
  if (!firstInvalid) return false;
  formElement.elements.namedItem(firstInvalid)?.focus();
  return true;
}
