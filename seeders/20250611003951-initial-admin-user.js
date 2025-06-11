'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Inserta directamente el usuario "diss" con sus datos existentes.
    // Como la contraseña ya está hasheada, no necesitamos bcryptjs aquí.

    await queryInterface.bulkInsert('Users', [{
      id: 2, // Especificamos el ID para mantener la consistencia
      username: 'diss',
      password: '$2b$10$gV5lQIoNNQ0U7T/HKeXG3.0FgYTLryBsw2nXHKDLMHvvAtzpV7cAa', // Contraseña ya hasheada
      roleId: 1, // Asumiendo que '1' es el ID para Administrador
      nombreCompleto: 'Disley Torres',
      documento: '1212234751',
      email: 'hhoney0210@gmail.com',
      celular: '3128897650',
      status: true, // El '1' de tus datos equivale a true
      createdAt: new Date('2025-03-27 23:03:01'),
      updatedAt: new Date('2025-06-06 03:22:22'),
      // Los campos passwordResetToken y passwordResetExpires son NULL, no se incluyen.
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // Esto eliminará el usuario "diss" si deshaces el seeder
    await queryInterface.bulkDelete('Users', { username: 'diss' }, {});
  }
};