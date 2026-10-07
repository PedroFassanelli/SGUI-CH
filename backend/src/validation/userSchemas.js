import { z } from 'zod';

// Request validation schemas. Besides validating, they normalize the input
// (trim spaces, uppercase document) so the service always receives clean data.

const requiredText = (label, max) =>
  z
    .string({ error: `${label} es obligatorio` })
    .trim()
    .min(1, { error: `${label} es obligatorio` })
    .max(max, { error: `${label} no puede superar los ${max} caracteres` });

const email = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'El email no tiene un formato válido' }));

const address = requiredText('El domicilio', 255);

// DNI (only digits) or passport (letters and digits).
const documentNumber = z
  .string({ error: 'El documento es obligatorio' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6,20}$/, {
    error: 'El documento debe tener entre 6 y 20 caracteres alfanuméricos, sin puntos ni espacios',
  });

const employeeNumber = z
  .string({ error: 'El legajo es obligatorio' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{1,20}$/, {
    error: 'El legajo debe tener hasta 20 caracteres alfanuméricos o guiones',
  });

// `strictObject` rejects unknown keys instead of silently ignoring them.
export const createUserSchema = z.strictObject({
  firstName: requiredText('El nombre', 100),
  lastName: requiredText('El apellido', 100),
  documentNumber,
  employeeNumber,
  email,
  address,
});

// Only contact data can be edited: identity fields are immutable.
export const updateUserSchema = z.strictObject({
  email,
  address,
});

const invalidIdMessage = 'El id debe ser un entero positivo';

export const userIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: invalidIdMessage })
    .int({ error: invalidIdMessage })
    .positive({ error: invalidIdMessage }),
});
