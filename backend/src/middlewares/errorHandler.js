import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { AppError } from '../errors/AppError.js';

const FIELD_LABELS = {
  documentNumber: 'documento',
  employeeNumber: 'legajo',
  email: 'email',
};

// Central error handler: every error thrown in the app ends up here and is
// translated into a consistent response shape: { error: { message, details? } }.
// Express recognizes it as an error handler because it has 4 parameters.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  if (err instanceof UniqueConstraintError) {
    const details = err.errors.map(({ path }) => ({
      location: 'body',
      field: path,
      message: `Ya existe un usuario con ese ${FIELD_LABELS[path] ?? path}`,
    }));
    return sendError(res, 409, 'El usuario ya existe', details);
  }

  if (err instanceof SequelizeValidationError) {
    const details = err.errors.map(({ path, message }) => ({
      location: 'body',
      field: path,
      message,
    }));
    return sendError(res, 400, 'Los datos enviados no son válidos', details);
  }

  // Malformed JSON body (thrown by express.json()).
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'El cuerpo de la petición no es un JSON válido');
  }

  console.error(err);
  return sendError(res, 500, 'Error interno del servidor');
}

function sendError(res, status, message, details) {
  res.status(status).json({ error: details ? { message, details } : { message } });
}
