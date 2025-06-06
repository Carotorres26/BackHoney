// src/repositorios/permissionRepository.js
const { Permission } = require('../modelos/associations'); // Ajusta la ruta si Permission no está en associations

const createPermission = async (permissionData) => {
  try {
    return await Permission.create(permissionData);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error(`El permiso con nombre '${permissionData.name}' ya existe.`);
    }
    throw error;
  }
};

const getAllPermissions = async () => {
  return Permission.findAll({
    order: [['name', 'ASC']],
    attributes: ['id', 'name'] // Solo devolver id y name
  });
};

const getPermissionById = async (id) => {
  const permissionId = parseInt(id, 10);
  return Permission.findByPk(permissionId, {
    attributes: ['id', 'name']
  });
};

const updatePermission = async (id, permissionData) => {
  const permissionId = parseInt(id, 10);
  const permission = await Permission.findByPk(permissionId);
  if (!permission) {
    return null; // O lanzar un error 404
  }
  // Prevenir actualización de 'name' a uno existente (excluyendo el actual)
  if (permissionData.name && permissionData.name !== permission.name) {
     const { Op } = require('sequelize'); // Importación local para Op
     const existing = await Permission.findOne({ where: { name: permissionData.name, id: { [Op.ne]: permissionId } } });
     if (existing) {
         throw new Error(`El nombre de permiso '${permissionData.name}' ya está en uso.`);
     }
  }
  const [affectedRows] = await Permission.update(permissionData, {
    where: { id: permissionId },
    returning: false // No necesitamos que devuelva las instancias
  });
  return affectedRows; // Devuelve el número de filas afectadas
};

const deletePermission = async (id) => {
  const permissionId = parseInt(id, 10);
  // Aquí podrías verificar si el permiso está en uso por algún rol antes de borrar
  // const rolesCount = await RolePermission.count({ where: { permissionId } });
  // if (rolesCount > 0) throw new Error('Permiso en uso, no se puede eliminar.');
  return Permission.destroy({ where: { id: permissionId } });
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};