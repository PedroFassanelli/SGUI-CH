import { NotFoundError } from '../errors/AppError.js';

// Catches any request that did not match a route.
export function notFound(req, _res, next) {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
