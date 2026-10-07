import { useCallback, useEffect, useState } from 'react';
import { usersApi } from '../api/usersApi.js';

// Loads the user list and exposes the operations the list screen needs.
// Components using it only see data and functions, never fetch or URLs.
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Changing this value re-runs the effect below, i.e. fetches the list again.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Cancels the request if the component unmounts (or reloads) before it finishes,
    // so we never set state with a stale response.
    const controller = new AbortController();

    usersApi
      .list({ signal: controller.signal })
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  // Deletes on the server and then removes the user from local state,
  // avoiding a second request to reload the whole list.
  const removeUser = useCallback(async (id) => {
    await usersApi.remove(id);
    setUsers((current) => current.filter((user) => user.id !== id));
  }, []);

  return { users, isLoading, error, reload, removeUser };
}
