import { Link } from 'react-router';
import { formatFullName } from '../utils/formatters.js';

// Presentational component: renders the users it receives and reports
// the delete intent upwards. It does not fetch or delete anything itself.
export function UserTable({ users, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Legajo</th>
            <th scope="col">Apellido y nombre</th>
            <th scope="col">Documento</th>
            <th scope="col">Email</th>
            <th scope="col">Domicilio</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const fullName = formatFullName(user);
            return (
              <tr key={user.id}>
                <td className="table__mono">{user.employeeNumber}</td>
                <td>{fullName}</td>
                <td className="table__mono">{user.documentNumber}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td className="table__actions">
                  <Link
                    to={`/users/${user.id}/edit`}
                    className="button button--small"
                    aria-label={`Editar a ${fullName}`}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="button button--small button--danger-outline"
                    onClick={() => onDelete(user)}
                    aria-label={`Eliminar a ${fullName}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
