const Role = require('../modelos/Role');

const createRole = async (role) => {
  return Role.create(role);
};

const getAllRoles = async () => {
  return Role.findAll();
};

const getRoleById = async (id) => {
  return Role.findByPk(id);
};

const updateRole = async (id, role) => {
  return Role.update(role, { where: { id } });
};

const deleteRole = async (id) => {
  return Role.destroy({ where: { id } });
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};