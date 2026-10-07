import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.dbStorage,
  logging: env.dbLogging ? console.log : false,
});
