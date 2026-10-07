import { ValidationError } from '../errors/AppError.js';

// Builds a middleware that validates parts of the request against zod schemas.
// On success, the parsed (normalized) values replace the raw ones.
// Usage: validate({ params: idSchema, body: createSchema })
export function validate(schemas) {
  return (req, _res, next) => {
    const details = [];

    for (const [location, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[location] ?? {});
      if (result.success) {
        req[location] = result.data;
      } else {
        details.push(...result.error.issues.map((issue) => toDetail(issue, location)));
      }
    }

    if (details.length > 0) {
      return next(new ValidationError(details));
    }
    next();
  };
}

function toDetail(issue, location) {
  if (issue.code === 'unrecognized_keys') {
    return {
      location,
      field: issue.keys.join(', '),
      message: `Campos no permitidos: ${issue.keys.join(', ')}`,
    };
  }
  return { location, field: issue.path.join('.'), message: issue.message };
}
