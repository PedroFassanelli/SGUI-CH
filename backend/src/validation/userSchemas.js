import { z } from 'zod';

// Request validation schemas. Besides validating, they normalize the input
// (trim spaces, uppercase document) so the service always receives clean data.
// They are also the source of the OpenAPI docs (see src/docs/openapi.js):
// `.meta()` adds the description and example shown in Swagger UI.

const requiredText = (label, max) =>
  z
    .string({ error: `${label} es obligatorio` })
    .trim()
    .min(1, { error: `${label} es obligatorio` })
    .max(max, { error: `${label} no puede superar los ${max} caracteres` });

const firstName = requiredText('El nombre', 100).meta({ description: 'Nombre', example: 'Ana' });

const lastName = requiredText('El apellido', 100).meta({
  description: 'Apellido',
  example: 'García',
});

const email = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'El email no tiene un formato válido' }))
  .meta({
    description: 'Email corporativo. Se guarda en minúsculas.',
    format: 'email',
    example: 'ana.garcia@empresa.com',
  });

const address = requiredText('El domicilio', 255).meta({
  description: 'Domicilio',
  example: 'Av. Corrientes 1234, CABA',
});

// DNI (only digits) or passport (letters and digits).
// The pattern accepts lowercase because the value is uppercased before saving.
const documentNumber = z
  .string({ error: 'El documento es obligatorio' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Za-z0-9]{6,20}$/, {
    error: 'El documento debe tener entre 6 y 20 caracteres alfanuméricos, sin puntos ni espacios',
  })
  .meta({
    description: 'DNI o pasaporte, sin puntos ni espacios. Se guarda en mayúsculas. Único.',
    example: '30123456',
  });

const employeeNumber = z
  .string({ error: 'El legajo es obligatorio' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Za-z0-9-]{1,20}$/, {
    error: 'El legajo debe tener hasta 20 caracteres alfanuméricos o guiones',
  })
  .meta({
    description: 'Legajo (identificador de empleado). Se guarda en mayúsculas. Único.',
    example: 'EMP-0001',
  });

// `strictObject` rejects unknown keys instead of silently ignoring them.
export const createUserSchema = z.strictObject({
  firstName,
  lastName,
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
