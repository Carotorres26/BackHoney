// seeders/4-create-admin-user.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // 1. Obtener el ID del rol 'Administrador' de forma dinámica.
      //    Esto elimina la suposición de que el ID es '1'.
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM Roles WHERE name = 'Administrador' LIMIT 1;`
      );

      if (!roles || roles.length === 0) {
        throw new Error('El seeder no pudo encontrar el rol "Administrador". Asegúrate de que el seeder de roles se haya ejecutado correctamente.');
      }
      const adminRoleId = roles[0].id;

      // 2. Insertar el usuario 'diss' usando el roleId dinámico.
      //    NO especificamos el 'id' para permitir que la base de datos lo asigne automáticamente.
      await queryInterface.bulkInsert('Users', [{
        username: 'diss',
        password: '$2b$10$gV5lQIoNNQ0U7T/HKeXG3.0FgYTLryBsw2nXHKDLMHvvAtzpV7cAa', // Contraseña ya hasheada
        roleId: adminRoleId, // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE!
        nombreCompleto: 'Disley Torres',
        documento: '1212234751',
        email: 'hhoney0210@gmail.com',
        celular: '3128897650',
        status: true,
        createdAt: new Date('2025-03-27 23:03:01'),
        updatedAt: new Date('2025-06-06 03:22:22'),
      }], {});

    } catch (error) {
      console.error('Error al ejecutar el seeder del usuario administrador:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // Para deshacer, es más seguro eliminar por un campo único como el email.
    await queryInterface.bulkDelete('Users', { email: 'hhoney0210@gmail.com' }, {});
  }
};