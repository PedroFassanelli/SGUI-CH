import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useUsers } from '../hooks/useUsers.js';
import { UserTable } from '../components/UserTable.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Alert } from '../components/Alert.jsx';
import { formatFullName } from '../utils/formatters.js';

export function UsersListPage() {
  const { users, isLoading, error, reload, removeUser } = useUsers();
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const flash = useFlashMessage();
  const [feedback, setFeedback] = useState(flash);

  async function handleConfirmDelete() {
    const fullName = formatFullName(userToDelete);
    setIsDeleting(true);
    try {
      await removeUser(userToDelete.id);
      setFeedback({ type: 'success', message: `Se eliminó a ${fullName}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: `No se pudo eliminar a ${fullName}: ${err.message}` });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Usuarios internos</h1>
          {!isLoading && !error && (
            <p className="page-header__subtitle">
              {users.length === 1 ? '1 usuario registrado' : `${users.length} usuarios registrados`}
            </p>
          )}
        </div>
        <Link to="/users/new" className="button button--primary">
          Nuevo usuario
        </Link>
      </div>

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <UsersListContent
        users={users}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onDelete={setUserToDelete}
      />

      <ConfirmDialog
        open={userToDelete !== null}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      >
        {userToDelete && (
          <p>
            ¿Seguro que querés eliminar a <strong>{formatFullName(userToDelete)}</strong> (legajo{' '}
            {userToDelete.employeeNumber})? Esta acción no se puede deshacer.
          </p>
        )}
      </ConfirmDialog>
    </section>
  );
}

// Reads the one-time message sent by other pages through the navigation state
// (e.g. "user created") and then clears it, so a page refresh doesn't show it again.
function useFlashMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const flash = location.state?.flash ?? null;

  useEffect(() => {
    if (flash) navigate('.', { replace: true, state: null });
  }, [flash, navigate]);

  return flash;
}

// Picks what to show for each state of the request: loading, error, empty or data.
function UsersListContent({ users, isLoading, error, onRetry, onDelete }) {
  if (isLoading) {
    return <p className="placeholder">Cargando usuarios…</p>;
  }

  if (error) {
    return (
      <Alert type="error">
        <p>{error.message}</p>
        <button type="button" className="button button--small" onClick={onRetry}>
          Reintentar
        </button>
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <div className="placeholder">
        <p>Todavía no hay usuarios registrados.</p>
        <Link to="/users/new" className="button button--primary">
          Dar de alta el primero
        </Link>
      </div>
    );
  }

  return <UserTable users={users} onDelete={onDelete} />;
}
