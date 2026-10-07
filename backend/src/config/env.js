// Single place where environment variables are read.
// The rest of the app imports `env` instead of touching `process.env` directly.
export const env = {
  port: Number(process.env.PORT) || 3000,
  dbStorage: process.env.DB_STORAGE || './database.sqlite',
  dbLogging: process.env.DB_LOGGING === 'true',
};
