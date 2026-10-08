import { describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { EditUserPage } from './EditUserPage.jsx';
import { usersApi } from '../api/usersApi.js';
import { ApiError } from '../api/httpClient.js';
import { renderPage } from '../test/renderPage.jsx';

vi.mock('../api/usersApi.js', () => ({
  usersApi: { getById: vi.fn(), updateContact: vi.fn() },
}));

const existingUser = {
  id: 7,
  firstName: 'Ana',
  lastName: 'García',
  documentNumber: '30123456',
  employeeNumber: 'EMP-0001',
  email: 'ana@empresa.com',
  address: 'Av. Corrientes 1234',
};

function renderEditPage() {
  return renderPage(<EditUserPage />, { path: '/users/:id/edit', route: '/users/7/edit' });
}

const saveButton = () => screen.getByRole('button', { name: 'Guardar cambios' });

describe('EditUserPage', () => {
  test('loads the user and only allows editing email and address', async () => {
    usersApi.getById.mockResolvedValue(existingUser);
    renderEditPage();

    expect(await screen.findByLabelText('Email')).toHaveValue('ana@empresa.com');
    expect(usersApi.getById).toHaveBeenCalledWith('7', expect.anything());
    expect(screen.getByLabelText('Domicilio')).toHaveValue('Av. Corrientes 1234');
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    // Identity data is displayed as read-only text.
    expect(screen.getByText('García, Ana')).toBeInTheDocument();
    expect(screen.getByText('EMP-0001')).toBeInTheDocument();
    expect(screen.getByText('30123456')).toBeInTheDocument();
  });

  test('enables saving only after something changed', async () => {
    usersApi.getById.mockResolvedValue(existingUser);
    const { user } = renderEditPage();
    const address = await screen.findByLabelText('Domicilio');

    expect(saveButton()).toBeDisabled();
    await user.type(address, ' 5º B');
    expect(saveButton()).toBeEnabled();
  });

  test('sends only the contact data and goes back to the list', async () => {
    usersApi.getById.mockResolvedValue(existingUser);
    usersApi.updateContact.mockResolvedValue({ ...existingUser, email: 'nuevo@empresa.com' });
    const { user } = renderEditPage();
    const email = await screen.findByLabelText('Email');

    await user.clear(email);
    await user.type(email, 'nuevo@empresa.com');
    await user.click(saveButton());

    expect(usersApi.updateContact).toHaveBeenCalledWith(7, {
      email: 'nuevo@empresa.com',
      address: 'Av. Corrientes 1234',
    });
    expect(
      await screen.findByText('Se actualizaron los datos de García, Ana.'),
    ).toBeInTheDocument();
  });

  test('does not submit an invalid email', async () => {
    usersApi.getById.mockResolvedValue(existingUser);
    const { user } = renderEditPage();
    const email = await screen.findByLabelText('Email');

    await user.clear(email);
    await user.type(email, 'sin-arroba');
    await user.click(saveButton());

    expect(email).toHaveAccessibleDescription('El email no tiene un formato válido');
    expect(usersApi.updateContact).not.toHaveBeenCalled();
  });

  test('shows a message when the user does not exist', async () => {
    usersApi.getById.mockRejectedValue(new ApiError('No existe', { status: 404 }));
    renderEditPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El usuario que querés editar no existe.',
    );
  });
});
