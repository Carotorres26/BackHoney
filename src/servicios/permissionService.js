// src/servicios/permissionService.js
const permissionRepository = require('../repositorios/permissionRepository');

const createPermission = async (permissionData) => {
  // Aquí podrías añadir lógica de negocio antes de llamar al repositorio
  try {
     const newPermission = await permissionRepository.createPermission(permissionData);
     if (!newPermission) throw new Error("No se pudo crear el permiso.");
     return newPermission;
  } catch (error) {
     const err = new Error(error.message || 'Error al crear el permiso en el servicio.');
     err.statusCode = error.message.includes("ya existe") ? 409 : 400;
     throw err;
  }
};

const getAllPermissions = async () => {
  try {
     const permissions = await permissionRepository.getAllPermissions();
     return permissions;
  } catch (error) {
     throw new Error(error.message || 'Error al obtener todos los permisos desde el servicio.');
  }
};

const getPermissionById = async (id) => {
  try {
     const permission = await permissionRepository.getPermissionById(id);
     if (!permission) {
         const error = new Error('Permiso no encontrado.');
         error.statusCode = 404;
         throw error;
     }
     return permission;
  } catch (error) {
     if (!error.statusCode) error.statusCode = 500;
     throw error;
  }
};

const updatePermission = async (id, permissionData) => {
  try {
     const affectedRows = await permissionRepository.updatePermission(id, permissionData);
     if (affectedRows === 0) {
         // Podría ser que no se encontró o los datos eran los mismos.
         // Primero, verificar si existe.
         const exists = await permissionRepository.getPermissionById(id);
         if (!exists) {
             const error = new Error('Permiso no encontrado para actualizar.');
             error.statusCode = 404;
             throw error;
         }
         // Si existe pero no se afectaron filas, los datos eran los mismos.
         console.warn(`[PermSvc Update] Permiso ID ${id}: No se realizaron cambios (datos idénticos o ID no encontrado en repo).`);
     }
     return { id, ...permissionData, affectedRows }; // Devolver algo informativo
  } catch (error) {
     const err = new Error(error.message || 'Error al actualizar el permiso en el servicio.');
     err.statusCode = error.message.includes("ya está en uso") ? 409 : (error.statusCode || 400);
     throw err;
  }
};

const deletePermission = async (id) => {
  try {
     const result = await permissionRepository.deletePermission(id);
     if (result === 0) {
         const error = new Error('Permiso no encontrado para eliminar o ya había sido eliminado.');
         error.statusCode = 404;
         throw error;
     }
     return { message: "Permiso eliminado exitosamente." };
  } catch (error) {
     if (!error.statusCode) error.statusCode = 500;
     throw error;
  }
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};