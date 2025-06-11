// seeders/3-assign-permissions-to-admin.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // 1. Obtener el ID del rol 'Administrador' dinámicamente.
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM Roles WHERE name = 'Administrador' LIMIT 1;`
      );
      
      if (!roles || roles.length === 0) {
        throw new Error('El seeder no pudo encontrar el rol "Administrador". Asegúrate de que el seeder de roles se haya ejecutado primero.');
      }
      const adminRoleId = roles[0].id;

      // 2. Obtener TODOS los IDs de la tabla de permisos.
      const [permissions] = await queryInterface.sequelize.query(
        `SELECT id FROM Permissions;`
      );
      
      if (!permissions || permissions.length === 0) {
        console.warn('Advertencia: No se encontraron permisos para asignar.');
        return;
      }

      // 3. Preparar los datos para la inserción masiva.
      //    >>> CORRECCIÓN APLICADA AQUÍ <<<
      //    Se eliminan createdAt y updatedAt para que coincida con el modelo (timestamps: false).
      const rolePermissionsData = permissions.map(permission => ({
        roleId: adminRoleId,
        permissionId: permission.id
      }));

      // 4. Insertar todas las asociaciones en la tabla 'RolePermissions'.
      await queryInterface.bulkInsert('RolePermissions', rolePermissionsData, {});

    } catch (error) {
      console.error('Error al ejecutar el seeder de RolePermissions:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'Administrador' LIMIT 1;`
    );
    if (roles && roles.length > 0) {
      const adminRoleId = roles[0].id;
      await queryInterface.bulkDelete('RolePermissions', { roleId: adminRoleId }, {});
    }
  }
};