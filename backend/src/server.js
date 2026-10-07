import { createApp } from './app.js';
import { sequelize } from './config/database.js';
import { env } from './config/env.js';

// Entry point: connects to the database, creates missing tables and starts listening.
// `sync()` only creates tables that don't exist; it never drops data.
// (In a production system we would use migrations instead.)
try {
  await sequelize.authenticate();
  await sequelize.sync();

  createApp().listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('No se pudo iniciar la API:', error);
  process.exit(1);
}
