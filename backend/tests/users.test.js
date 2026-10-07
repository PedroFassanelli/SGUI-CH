import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { buildUserPayload, insertUser, useTestDatabase } from './helpers.js';

const app = createApp();

useTestDatabase();

// Returns the list of invalid field names from an error response.
const invalidFields = (res) => res.body.error.details.map((detail) => detail.field);

describe('GET /api/users', () => {
  test('returns an empty list when there are no users', async () => {
    const res = await request(app).get('/api/users');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  test('returns users sorted by last name and first name, following Spanish rules', async () => {
    await insertUser({ firstName: 'Zoe', lastName: 'Pérez' });
    await insertUser({ firstName: 'Ana', lastName: 'Pérez' });
    await insertUser({ firstName: 'Luis', lastName: 'de la Fuente' });
    await insertUser({ firstName: 'Juan', lastName: 'Álvarez' });

    const res = await request(app).get('/api/users');

    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.map((user) => `${user.lastName}, ${user.firstName}`),
      ['Álvarez, Juan', 'de la Fuente, Luis', 'Pérez, Ana', 'Pérez, Zoe'],
    );
  });
});

describe('GET /api/users/:id', () => {
  test('returns the user', async () => {
    const user = await insertUser();

    const res = await request(app).get(`/api/users/${user.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, user.id);
    assert.equal(res.body.email, user.email);
  });

  test('returns 404 when the user does not exist', async () => {
    const res = await request(app).get('/api/users/999');

    assert.equal(res.status, 404);
    assert.match(res.body.error.message, /999/);
  });

  for (const invalidId of ['abc', '0', '-1', '1.5']) {
    test(`returns 400 for invalid id "${invalidId}"`, async () => {
      const res = await request(app).get(`/api/users/${invalidId}`);

      assert.equal(res.status, 400);
      assert.deepEqual(invalidFields(res), ['id']);
    });
  }
});

describe('POST /api/users', () => {
  test('creates the user and returns 201 with its location', async () => {
    const payload = buildUserPayload();

    const res = await request(app).post('/api/users').send(payload);

    assert.equal(res.status, 201);
    assert.equal(typeof res.body.id, 'number');
    assert.equal(res.headers.location, `/api/users/${res.body.id}`);
    assert.partialDeepStrictEqual(res.body, payload);
    assert.ok(await User.findByPk(res.body.id), 'user should be persisted');
  });

  test('normalizes the input before saving', async () => {
    const payload = buildUserPayload({
      firstName: '  Ana  ',
      documentNumber: 'aab123456',
      employeeNumber: 'emp-77',
      email: '  Ana.Garcia@Empresa.COM ',
    });

    const res = await request(app).post('/api/users').send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.firstName, 'Ana');
    assert.equal(res.body.documentNumber, 'AAB123456');
    assert.equal(res.body.employeeNumber, 'EMP-77');
    assert.equal(res.body.email, 'ana.garcia@empresa.com');
  });

  test('preserves accents and special characters', async () => {
    const payload = buildUserPayload({ firstName: 'Martín', lastName: 'Muñoz Peña' });

    const res = await request(app).post('/api/users').send(payload);
    const saved = await User.findByPk(res.body.id);

    assert.equal(saved.firstName, 'Martín');
    assert.equal(saved.lastName, 'Muñoz Peña');
  });

  test('returns 400 listing every missing field', async () => {
    const res = await request(app).post('/api/users').send({});

    assert.equal(res.status, 400);
    assert.deepEqual(invalidFields(res).sort(), [
      'address',
      'documentNumber',
      'email',
      'employeeNumber',
      'firstName',
      'lastName',
    ]);
  });

  test('returns 400 when required fields are only whitespace', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(buildUserPayload({ firstName: '   ', address: '' }));

    assert.equal(res.status, 400);
    assert.deepEqual(invalidFields(res).sort(), ['address', 'firstName']);
  });

  const invalidValues = {
    email: 'not-an-email',
    documentNumber: '30.123.456',
    employeeNumber: 'EMP 01',
    firstName: 'x'.repeat(101),
  };

  for (const [field, value] of Object.entries(invalidValues)) {
    test(`returns 400 for invalid ${field}`, async () => {
      const res = await request(app)
        .post('/api/users')
        .send(buildUserPayload({ [field]: value }));

      assert.equal(res.status, 400);
      assert.deepEqual(invalidFields(res), [field]);
    });
  }

  test('returns 400 for fields that are not part of the contract', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(buildUserPayload({ id: 50, role: 'admin' }));

    assert.equal(res.status, 400);
    assert.match(res.body.error.details[0].message, /id, role/);
  });

  for (const field of ['documentNumber', 'employeeNumber', 'email']) {
    test(`returns 409 when ${field} is already in use`, async () => {
      const existing = await insertUser();

      const res = await request(app)
        .post('/api/users')
        .send(buildUserPayload({ [field]: existing[field] }));

      assert.equal(res.status, 409);
      assert.deepEqual(invalidFields(res), [field]);
      assert.equal(await User.count(), 1);
    });
  }
});

describe('PUT /api/users/:id', () => {
  const contactUpdate = { email: 'nuevo@empresa.com', address: 'Mitre 200, Rosario' };

  test('updates email and address, keeping identity fields', async () => {
    const user = await insertUser();

    const res = await request(app).put(`/api/users/${user.id}`).send(contactUpdate);

    assert.equal(res.status, 200);
    assert.partialDeepStrictEqual(res.body, {
      ...contactUpdate,
      firstName: user.firstName,
      documentNumber: user.documentNumber,
      employeeNumber: user.employeeNumber,
    });
    const saved = await User.findByPk(user.id);
    assert.equal(saved.email, contactUpdate.email);
    assert.equal(saved.address, contactUpdate.address);
  });

  test('allows keeping the same email', async () => {
    const user = await insertUser();

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ email: user.email, address: 'Otra calle 1' });

    assert.equal(res.status, 200);
  });

  test('returns 400 when trying to change identity fields', async () => {
    const user = await insertUser();

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ ...contactUpdate, firstName: 'Otro', documentNumber: '99999999' });

    assert.equal(res.status, 400);
    const saved = await User.findByPk(user.id);
    assert.equal(saved.firstName, user.firstName);
    assert.equal(saved.documentNumber, user.documentNumber);
  });

  test('returns 400 when email or address are missing', async () => {
    const user = await insertUser();

    const res = await request(app).put(`/api/users/${user.id}`).send({});

    assert.equal(res.status, 400);
    assert.deepEqual(invalidFields(res).sort(), ['address', 'email']);
  });

  test('returns 404 when the user does not exist', async () => {
    const res = await request(app).put('/api/users/999').send(contactUpdate);

    assert.equal(res.status, 404);
  });

  test('returns 409 when the email belongs to another user', async () => {
    const other = await insertUser();
    const user = await insertUser();

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ ...contactUpdate, email: other.email });

    assert.equal(res.status, 409);
    assert.deepEqual(invalidFields(res), ['email']);
  });
});

describe('DELETE /api/users/:id', () => {
  test('deletes the user and returns 204 with no body', async () => {
    const user = await insertUser();

    const res = await request(app).delete(`/api/users/${user.id}`);

    assert.equal(res.status, 204);
    assert.equal(res.text, '');
    assert.equal(await User.findByPk(user.id), null);
  });

  test('returns 404 when the user does not exist', async () => {
    const res = await request(app).delete('/api/users/999');

    assert.equal(res.status, 404);
  });
});
