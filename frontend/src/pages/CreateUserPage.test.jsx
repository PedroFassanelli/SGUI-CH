import { describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { CreateUserPage } from './CreateUserPage.jsx';
import { usersApi } from '../api/usersApi.js';
import { ApiError } from '../api/httpClient.js';
import { renderPage } from '../test/renderPage.jsx';

// Replace the real API module: tests never hit the network.
vi.mock('../api/usersApi.js', () => ({ usersApi: { create: vi.fn() } }));

const validUser = {
  Nombre: 'Ana',
  Apellido: 'García',
  Documento: '30123456',
  Legajo: 'EMP-0001',
  Email: 'ana@empresa.com',
  Domicilio: 'Av. Corrientes 1234',
};

function renderCreatePage() {
  return renderPage(<CreateUserPage />, { path: '/users/new' });
}

async function fillForm(user, values) {
  for (const [label, value] of Object.entries(values)) {
    await user.type(screen.getByLabelText(label), value);
  }
}

const submitButton = () => screen.getByRole('button', { name: 'Dar de alta' });

describe('CreateUserPage', () => {
  test('shows an error for every empty field and does not call the API', async () => {
    const { user } = renderCreatePage();

    await user.click(submitButton());

    for (const label of Object.keys(validUser)) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    }
    expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription('El nombre es obligatorio');
    expect(screen.getByLabelText('Nombre')).toHaveFocus();
    expect(usersApi.create).not.toHaveBeenCalled();
  });

  test('validates a field when leaving it and clears the error once fixed', async () => {
    const { user } = renderCreatePage();
    const email = screen.getByLabelText('Email');

    await user.type(email, 'ana@');
    expect(email).toHaveAttribute('aria-invalid', 'false'); // no error while typing the first time

    await user.tab();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('El email no tiene un formato válido');

    await user.type(email, 'empresa.com');
    expect(email).toHaveAttribute('aria-invalid', 'false');
  });

  test('creates the user and goes back to the list with a success message', async () => {
    usersApi.create.mockResolvedValue({ id: 1, firstName: 'Ana', lastName: 'García' });
    const { user } = renderCreatePage();

    await fillForm(user, validUser);
    await user.click(submitButton());

    expect(usersApi.create).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'García',
      documentNumber: '30123456',
      employeeNumber: 'EMP-0001',
      email: 'ana@empresa.com',
      address: 'Av. Corrientes 1234',
    });
    expect(await screen.findByRole('heading', { name: 'Listado' })).toBeInTheDocument();
    expect(screen.getByText('Se dio de alta a García, Ana.')).toBeInTheDocument();
  });

  test('shows a duplicate error returned by the API under its field', async () => {
    usersApi.create.mockRejectedValue(
      new ApiError('El usuario ya existe', {
        status: 409,
        details: [{ field: 'documentNumber', message: 'Ya existe un usuario con ese documento' }],
      }),
    );
    const { user } = renderCreatePage();

    await fillForm(user, validUser);
    await user.click(submitButton());

    const documentInput = await screen.findByLabelText('Documento');
    expect(documentInput).toHaveAttribute('aria-invalid', 'true');
    expect(documentInput).toHaveAccessibleDescription(
      expect.stringContaining('Ya existe un usuario con ese documento'),
    );
    expect(documentInput).toHaveFocus();
    expect(submitButton()).toBeEnabled();
  });

  test('shows a general error when the API cannot be reached', async () => {
    usersApi.create.mockRejectedValue(new ApiError('No se pudo conectar con el servidor.'));
    const { user } = renderCreatePage();

    await fillForm(user, validUser);
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo conectar con el servidor.',
    );
  });
});
