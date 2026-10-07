// Thin wrapper around fetch: sends/receives JSON and turns any failure into an
// ApiError, so the rest of the app never deals with raw HTTP responses.

export class ApiError extends Error {
  constructor(message, { status = 0, details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const UNAVAILABLE_MESSAGE =
  'No se pudo conectar con el servidor. Verificá que la API esté levantada.';

// Gateway errors: a proxy (e.g. Vite's in development) answered because the API didn't.
const GATEWAY_STATUSES = new Set([502, 503, 504]);

export async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Aborted requests are expected (e.g. component unmounted): let them through.
    if (error.name === 'AbortError') throw error;
    throw new ApiError(UNAVAILABLE_MESSAGE);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(errorMessageFor(response.status, data), {
      status: response.status,
      details: data?.error?.details,
    });
  }

  return data;
}

function errorMessageFor(status, data) {
  if (data?.error?.message) return data.error.message;
  if (GATEWAY_STATUSES.has(status)) return UNAVAILABLE_MESSAGE;
  return `Error inesperado (${status})`;
}
