import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../validation/userSchemas.js';

// OpenAPI 3.1 description of the API, served by Swagger UI at /api/docs.
// Request bodies are generated from the same zod schemas used for validation,
// so the docs cannot drift from what the API actually accepts.

function toOpenApiSchema(zodSchema) {
  // `io: 'input'` describes what the client sends (before trim/uppercase).
  const { $schema, ...schema } = z.toJSONSchema(zodSchema, { io: 'input' });
  return schema;
}

const jsonContent = (schema) => ({ 'application/json': { schema } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const responseRef = (name) => ({ $ref: `#/components/responses/${name}` });

const createUserBody = toOpenApiSchema(createUserSchema);

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'API de Usuarios Internos',
    version: '1.0.0',
    description: 'API REST para que Recursos Humanos gestione los empleados internos.',
  },
  tags: [{ name: 'Usuarios', description: 'Alta, baja, modificación y consulta de empleados' }],
  paths: {
    '/api/users': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        description: 'Devuelve todos los usuarios ordenados por apellido y nombre.',
        responses: {
          200: {
            description: 'Listado de usuarios',
            content: jsonContent({ type: 'array', items: ref('User') }),
          },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        requestBody: { required: true, content: jsonContent(ref('UserCreate')) },
        responses: {
          201: {
            description: 'Usuario creado',
            headers: {
              Location: { description: 'URL del nuevo recurso', schema: { type: 'string' } },
            },
            content: jsonContent(ref('User')),
          },
          400: responseRef('ValidationError'),
          409: responseRef('Conflict'),
        },
      },
    },
    '/api/users/{id}': {
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener un usuario',
        responses: {
          200: { description: 'Usuario encontrado', content: jsonContent(ref('User')) },
          400: responseRef('ValidationError'),
          404: responseRef('NotFound'),
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar datos de contacto',
        description:
          'Solo se pueden modificar el email y el domicilio. Cualquier otro campo devuelve 400.',
        requestBody: { required: true, content: jsonContent(ref('UserUpdate')) },
        responses: {
          200: { description: 'Usuario actualizado', content: jsonContent(ref('User')) },
          400: responseRef('ValidationError'),
          404: responseRef('NotFound'),
          409: responseRef('Conflict'),
        },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario',
        responses: {
          204: { description: 'Usuario eliminado' },
          400: responseRef('ValidationError'),
          404: responseRef('NotFound'),
        },
      },
    },
  },
  components: {
    parameters: {
      UserId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del usuario',
        schema: { type: 'integer', minimum: 1 },
      },
    },
    schemas: {
      UserCreate: createUserBody,
      UserUpdate: toOpenApiSchema(updateUserSchema),
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Generado por la base de datos', example: 1 },
          ...createUserBody.properties,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', enum: ['body', 'params'] },
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Datos inválidos',
        content: jsonContent(ref('Error')),
      },
      NotFound: {
        description: 'El usuario no existe',
        content: jsonContent(ref('Error')),
      },
      Conflict: {
        description: 'Ya existe un usuario con ese documento, legajo o email',
        content: jsonContent(ref('Error')),
      },
    },
  },
};
