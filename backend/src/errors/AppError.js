// Domain errors. Services throw them without knowing about HTTP;
// the error handler middleware maps `statusCode` to the response.
export class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(details) {
    super('Los datos enviados no son válidos', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message, details) {
    super(message, 409, details);
  }
}
