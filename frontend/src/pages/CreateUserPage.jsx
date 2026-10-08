import { useNavigate } from 'react-router';
import { usersApi } from '../api/usersApi.js';
import { useUserForm } from '../hooks/useUserForm.js';
import { UserForm } from '../components/UserForm.jsx';
import { formatFullName } from '../utils/formatters.js';

// Key order defines the order of the inputs in the form.
const EMPTY_USER = {
  firstName: '',
  lastName: '',
  documentNumber: '',
  employeeNumber: '',
  email: '',
  address: '',
};

export function CreateUserPage() {
  const navigate = useNavigate();

  const form = useUserForm({
    initialValues: EMPTY_USER,
    onSubmit: async (values) => {
      const created = await usersApi.create(values);
      // The message travels in the navigation state and is shown by the list page.
      navigate('/', {
        state: {
          flash: { type: 'success', message: `Se dio de alta a ${formatFullName(created)}.` },
        },
      });
    },
  });

  return (
    <section className="narrow">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Nuevo usuario</h1>
          <p className="page-header__subtitle">Todos los campos son obligatorios.</p>
        </div>
      </div>
      <UserForm form={form} submitLabel="Dar de alta" />
    </section>
  );
}
