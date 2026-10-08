import { useEffect, useState } from 'react';
import { usersApi } from '../api/usersApi.js';

// Loads a single user by id.
// The result is stored together with the id it belongs to: if the id changes,
// `isLoading` becomes true immediately and stale data is never shown.
export function useUser(id) {
  const [result, setResult] = useState({ id: null, user: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    usersApi
      .getById(id, { signal: controller.signal })
      .then((user) => setResult({ id, user, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ id, user: null, error });
      });

    return () => controller.abort();
  }, [id]);

  return {
    user: result.user,
    error: result.error,
    isLoading: result.id !== id,
  };
}
