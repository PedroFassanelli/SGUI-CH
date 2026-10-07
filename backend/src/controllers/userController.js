import * as userService from '../services/userService.js';

// Controllers translate HTTP <-> service calls. Input arrives already validated
// and normalized by the `validate` middleware. No try/catch needed: Express 5
// forwards rejected promises to the error handler automatically.

export async function listUsers(_req, res) {
  const users = await userService.findAllUsers();
  res.json(users);
}

export async function getUser(req, res) {
  const user = await userService.findUserById(req.params.id);
  res.json(user);
}

export async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).location(`/api/users/${user.id}`).json(user);
}

export async function updateUser(req, res) {
  const user = await userService.updateUserContact(req.params.id, req.body);
  res.json(user);
}

export async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id);
  res.status(204).end();
}
