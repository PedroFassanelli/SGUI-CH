import { describe, expect, test } from 'vitest';
import { validateUserField, validateUserFields } from './userValidation.js';

const validUser = {
  firstName: 'Ana',
  lastName: 'García',
  documentNumber: '30123456',
  employeeNumber: 'EMP-0001',
  email: 'ana@empresa.com',
  address: 'Av. Corrientes 1234',
};

describe('validateUserFields', () => {
  test('returns no errors for a valid user', () => {
    expect(validateUserFields(validUser)).toEqual({});
  });

  test('requires every field', () => {
    const empty = Object.fromEntries(Object.keys(validUser).map((key) => [key, '']));

    expect(Object.keys(validateUserFields(empty)).sort()).toEqual(Object.keys(validUser).sort());
  });

  test('only validates the requested fields', () => {
    const errors = validateUserFields({ email: 'wrong', address: '' }, ['email']);

    expect(errors).toEqual({ email: 'El email no tiene un formato válido' });
  });
});

describe('validateUserField', () => {
  test.each([
    ['firstName', '   ', 'El nombre es obligatorio'],
    ['firstName', 'x'.repeat(101), 'El nombre no puede superar los 100 caracteres'],
    ['email', 'ana@empresa', 'El email no tiene un formato válido'],
    ['email', 'ana @empresa.com', 'El email no tiene un formato válido'],
    ['documentNumber', '30.123.456', expect.stringMatching(/sin puntos ni espacios/)],
    ['documentNumber', '12345', expect.stringMatching(/entre 6 y 20/)],
    ['employeeNumber', 'EMP 01', expect.stringMatching(/alfanuméricos o guiones/)],
  ])('%s = "%s" is invalid', (field, value, expected) => {
    expect(validateUserField(field, value)).toEqual(expected);
  });

  test.each([
    ['documentNumber', '30123456'],
    ['documentNumber', 'aab123456'],
    ['employeeNumber', 'emp-0001'],
    ['email', '  ana.garcia@empresa.com.ar  '],
  ])('%s = "%s" is valid', (field, value) => {
    expect(validateUserField(field, value)).toBeNull();
  });
});
