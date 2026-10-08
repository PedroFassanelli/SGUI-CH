import { Link, useNavigate, useParams } from 'react-router';
import { usersApi } from '../api/usersApi.js';
import { useUser } from '../hooks/useUser.js';
import { useUserForm } from '../hooks/useUserForm.js';
import { UserForm } from '../components/UserForm.jsx';
import { Alert } from '../components/Alert.jsx';
import { formatFullName } from '../utils/formatters.js';

// Loads the user and, once available, renders the form.
// Splitting it in two components lets the form start with the loaded values.
export function EditUserPage() {
  const { id } = useParams();
  const { user, isLoading, error } = useUser(id);

  if (isLoading) {
    return <p className="placeholder">Cargando usuario…</p>;
  }

  if (error) {
    return (
      <section className="narrow">
        <Alert type="error">
          <p>{error.status === 404 ? 'El usuario que querés editar no existe.' : error.message}</p>
          <Link to="/" className="button button--small">
            Volver al listado
          </Link>
        </Alert>
      </section>
    );
  }

  // `key` resets the form state if the route changes to a different user.
  return <EditUserForm key={user.id} user={user} />;
}

function EditUserForm({ user }) {
  const navigate = useNavigate();
  const fullName = formatFullName(user);

  const form = useUserForm({
    // Only contact data is editable: identity fields are shown read-only below.
    initialValues: { email: user.email, address: user.address },
    onSubmit: async (values) => {
      await usersApi.updateContact(user.id, values);
      navigate('/', {
        state: { flash: { type: 'success', message: `Se actualizaron los datos de ${fullName}.` } },
      });
    },
  });

  return (
    <section className="narrow">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Editar usuario</h1>
          <p className="page-header__subtitle">Solo se pueden modificar el email y el domicilio.</p>
        </div>
      </div>

      <dl className="summary">
        <div>
          <dt>Apellido y nombre</dt>
          <dd>{fullName}</dd>
        </div>
        <div>
          <dt>Legajo</dt>
          <dd className="table__mono">{user.employeeNumber}</dd>
        </div>
        <div>
          <dt>Documento</dt>
          <dd className="table__mono">{user.documentNumber}</dd>
        </div>
      </dl>

      <UserForm form={form} submitLabel="Guardar cambios" isSubmitDisabled={!form.isDirty} />
    </section>
  );
}
