import { User } from '../models/User.js';
import { NotFoundError } from '../errors/AppError.js';

// Business logic for internal users. Knows nothing about HTTP (no req/res).
// Unique constraint violations (duplicated email, document or employee number)
// are not pre-checked here: the database enforces them atomically and the
// error handler translates them into a 409 response.

// SQLite sorts text by raw bytes, which puts "Álvarez" after "Pérez" and
// lowercase after uppercase. We sort in memory with Spanish collation rules.
// Fine for an unpaginated list; with pagination, sorting must move to the DB.
const spanishCollator = new Intl.Collator('es', { sensitivity: 'base' });

const byFullName = (a, b) =>
  spanishCollator.compare(a.lastName, b.lastName) ||
  spanishCollator.compare(a.firstName, b.firstName);

export async function findAllUsers() {
  const users = await User.findAll();
  return users.sort(byFullName);
}

export async function findUserById(id) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError(`No existe un usuario con id ${id}`);
  }
  return user;
}

export function createUser(data) {
  return User.create(data);
}

export async function updateUserContact(id, { email, address }) {
  const user = await findUserById(id);
  return user.update({ email, address });
}

export async function deleteUser(id) {
  const user = await findUserById(id);
  await user.destroy();
}
