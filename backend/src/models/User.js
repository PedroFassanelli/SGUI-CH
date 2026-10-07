import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Database-level constraints. They are the last line of defense:
// request validation (src/validation) runs before any of this.
export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    employeeNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'users',
  },
);
