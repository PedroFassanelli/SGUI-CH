import { after, before, beforeEach } from 'node:test';
import { sequelize } from '../src/config/database.js';
import { User } from '../src/models/User.js';

// Registers hooks that give each test a clean, empty database.
// Node runs every test file in its own process, so each file gets its own
// in-memory SQLite database (see .env.test).
export function useTestDatabase() {
  before(() => sequelize.sync({ force: true }));
  beforeEach(() => User.destroy({ truncate: true }));
  after(() => sequelize.close());
}

// Valid request body for POST /api/users. Each call returns unique values
// so tests can create several users without hitting unique constraints.
let sequence = 0;

export function buildUserPayload(overrides = {}) {
  sequence += 1;
  return {
    firstName: 'Ana',
    lastName: 'García',
    documentNumber: `3000000${sequence}`,
    employeeNumber: `EMP-${sequence}`,
    email: `ana${sequence}@empresa.com`,
    address: 'Av. Corrientes 1234, CABA',
    ...overrides,
  };
}

// Inserts a user directly through the model, skipping HTTP.
// Useful for "arrange" steps when the test is about another endpoint.
export function insertUser(overrides = {}) {
  return User.create(buildUserPayload(overrides));
}
