import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { useTestDatabase } from './helpers.js';

const app = createApp();

useTestDatabase();

describe('application', () => {
  test('GET /api/health responds ok', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  test('unknown routes return 404 with the standard error shape', async () => {
    const res = await request(app).get('/api/does-not-exist');

    assert.equal(res.status, 404);
    assert.match(res.body.error.message, /GET \/api\/does-not-exist/);
  });

  test('a malformed JSON body returns 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send('{"firstName": ');

    assert.equal(res.status, 400);
    assert.equal(res.body.error.message, 'El cuerpo de la petición no es un JSON válido');
  });
});

describe('API docs', () => {
  test('serves the OpenAPI document', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    assert.equal(res.status, 200);
    assert.equal(res.body.openapi, '3.1.0');
    assert.ok(res.body.paths['/api/users']);
    assert.ok(res.body.paths['/api/users/{id}']);
  });

  test('request schemas are generated from the validation schemas', async () => {
    const res = await request(app).get('/api/docs/openapi.json');
    const { UserCreate, UserUpdate } = res.body.components.schemas;

    assert.deepEqual(UserCreate.required.sort(), [
      'address',
      'documentNumber',
      'email',
      'employeeNumber',
      'firstName',
      'lastName',
    ]);
    assert.deepEqual(Object.keys(UserUpdate.properties).sort(), ['address', 'email']);
    assert.equal(UserCreate.additionalProperties, false);
  });

  test('serves the Swagger UI', async () => {
    const res = await request(app).get('/api/docs/');

    assert.equal(res.status, 200);
    assert.match(res.text, /swagger-ui/i);
  });
});
