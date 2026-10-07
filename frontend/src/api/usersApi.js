import { request } from './httpClient.js';

// One function per backend endpoint. Components and hooks use these,
// never `fetch` or URLs directly.
const BASE_PATH = '/api/users';

export const usersApi = {
  list: ({ signal } = {}) => request(BASE_PATH, { signal }),

  getById: (id, { signal } = {}) => request(`${BASE_PATH}/${id}`, { signal }),

  create: (user) => request(BASE_PATH, { method: 'POST', body: user }),

  updateContact: (id, { email, address }) =>
    request(`${BASE_PATH}/${id}`, { method: 'PUT', body: { email, address } }),

  remove: (id) => request(`${BASE_PATH}/${id}`, { method: 'DELETE' }),
};
