import { sequelize } from '../src/config/database.js';
import { User } from '../src/models/User.js';

// Resets the database and loads sample employees.
// WARNING: `force: true` drops the table, deleting all existing data.
const sampleUsers = [
  {
    firstName: 'Ana',
    lastName: 'García',
    documentNumber: '30123456',
    employeeNumber: 'EMP-0001',
    email: 'ana.garcia@empresa.com',
    address: 'Av. Corrientes 1234, CABA',
  },
  {
    firstName: 'Martín',
    lastName: 'López',
    documentNumber: '28987654',
    employeeNumber: 'EMP-0002',
    email: 'martin.lopez@empresa.com',
    address: 'Calle 7 Nº 845, La Plata',
  },
  {
    firstName: 'Lucía',
    lastName: 'Fernández',
    documentNumber: 'AAB123456',
    employeeNumber: 'EMP-0003',
    email: 'lucia.fernandez@empresa.com',
    address: 'Bv. Oroño 550, Rosario',
  },
];

try {
  await sequelize.sync({ force: true });
  await User.bulkCreate(sampleUsers);
  console.log(`Seed completado: ${sampleUsers.length} usuarios cargados.`);
} catch (error) {
  console.error('Error ejecutando el seed:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
