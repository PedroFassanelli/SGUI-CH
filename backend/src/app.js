import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { userRouter } from './routes/userRoutes.js';
import { openApiDocument } from './docs/openapi.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Builds the Express app without starting the server, so tests can import it.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/users', userRouter);

  // API documentation: interactive UI and the raw OpenAPI document.
  app.get('/api/docs/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Order matters: these two must be registered after all routes.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
