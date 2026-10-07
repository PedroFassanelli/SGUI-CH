import express from 'express';
import { userRouter } from './routes/userRoutes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Builds the Express app without starting the server, so tests can import it.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/users', userRouter);

  // Order matters: these two must be registered after all routes.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
