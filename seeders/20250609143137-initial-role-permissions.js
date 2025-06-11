// seeders/...-initial-role-permissions.js - VERSIÓN ROBUSTA

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // 1. Obtener el ID del rol 'Administrador' dinámicamente
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM Roles WHERE name = 'Administrador' LIMIT 1;`
      );
      if (!roles || roles.length === 0) {
        throw new Error('El rol "Administrador" no fue encontrado.');
      }
      const adminRoleId = roles[0].id;

      // 2. Obtener TODOS los IDs de la tabla de permisos
      const [permissions] = await queryInterface.sequelize.query(
        `SELECT id FROM Permissions;`
      );
      const permissionIds = permissions.map(p => p.id);

      // 3. Preparar los datos para la inserción
      const rolePermissions = permissionIds.map(permissionId => ({
        roleId: adminRoleId,
        permissionId: permissionId
      }));

      // 4. Insertar todos los permisos para ese rol
      await queryInterface.bulkInsert('RolePermissions', rolePermissions, {});

    } catch (error) {
      console.error('Error en el seeder de RolePermissions:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // Para deshacer, podríamos buscar el ID del rol y borrar las entradas
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'Administrador' LIMIT 1;`
    );
    if (roles && roles.length > 0) {
      const adminRoleId = roles[0].id;
      await queryInterface.bulkDelete('RolePermissions', { roleId: adminRoleId }, {});
    }
  }
};