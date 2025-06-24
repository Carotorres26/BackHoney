// seeders/1-create-permissions.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Permissions', [
      // Roles
      { name: 'acceso_roles', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearRoles', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerRoles', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarRoles', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarRoles', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cambiarEstadoRoles', createdAt: new Date(), updatedAt: new Date() },
      // Clientes
      { name: 'acceso_clientes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearClientes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerClientes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarClientes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cambiarEstadoClientes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarClientes', createdAt: new Date(), updatedAt: new Date() },
      // Contratos
      { name: 'acceso_contratos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearContratos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerContratos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarContratos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarContratos', createdAt: new Date(), updatedAt: new Date() },
      // Pagos
      { name: 'acceso_pagos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearPagos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerPagos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarPagos', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarPagos', createdAt: new Date(), updatedAt: new Date() },
      // Sedes
      { name: 'acceso_sedes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearSedes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerSedes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarSedes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarSedes', createdAt: new Date(), updatedAt: new Date() },
      // Servicios
      { name: 'acceso_servicios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearServicios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerServicios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarServicios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarServicios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cambiarEstadoServicios', createdAt: new Date(), updatedAt: new Date() },
      // Categorías
      { name: 'acceso_categorias', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearCategorias', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerCategorias', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarCategorias', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarCategorias', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cambiarEstadoCategorias', createdAt: new Date(), updatedAt: new Date() },
      // Ejemplares
      { name: 'acceso_ejemplares', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearEjemplares', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerEjemplares', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarEjemplares', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarEjemplares', createdAt: new Date(), updatedAt: new Date() },
      { name: 'moverEjemplares', createdAt: new Date(), updatedAt: new Date() },
      // Medicina
      { name: 'acceso_medicina', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearMedicina', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerMedicina', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarMedicina', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarMedicina', createdAt: new Date(), updatedAt: new Date() },
      // Usuarios
      { name: 'acceso_usuarios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'editarUsuarios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarUsuarios', createdAt: new Date(), updatedAt: new Date() },
      { name: 'cambiarEstadoUsuarios', createdAt: new Date(), updatedAt: new Date() },
      // Dashboard
      { name: 'acceso_dashboard', createdAt: new Date(), updatedAt: new Date() },
      // Alimentacion
      { name: 'accesoAlimentacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearAlimentacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerAlimentacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarAlimentacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarAlimentacion', createdAt: new Date(), updatedAt: new Date() },
      // Vacunacion
      { name: 'accesoVacunacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'crearVacunacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'leerVacunacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'actualizarVacunacion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'eliminarVacunacion', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};