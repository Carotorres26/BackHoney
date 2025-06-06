// src/controladores/roleController.js
const { validationResult } = require('express-validator');
const roleService = require('../servicios/roleService');

const createRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // El frontend envía 'permissions' como un array de NOMBRES de permisos
    const { name, permissions, status } = req.body; 
    console.log("[CTRL createRole] Datos recibidos:", { name, permissions: permissions || [], status }); // Asegurar que permissions sea array
    const newRole = await roleService.createRole(name, permissions || [], status); // Pasar status también
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error en roleController.createRole:", error.message, error.stack ? error.stack.substring(0,200) : '');
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al crear el rol.' });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await roleService.getAllRoles(includeInactive);
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error en roleController.getAllRoles:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener los roles.' });
  }
};

const getRoleById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.status(200).json(role);
  } catch (error) {
    console.error(`[CTRL getRoleById ID: ${req.params.id}] Error:`, error.message);
    res.status(error.statusCode || (error.message.toLowerCase().includes("no encontrado") ? 404 : 500)).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, permissions } = req.body; 
    const roleId = req.params.id;
    console.log(`[CTRL updateRole ID: ${roleId}] Datos recibidos:`, { name, permissions: permissions || [] });
    const updatedRole = await roleService.updateRole(roleId, { name, permissions: permissions || [] });
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error(`[CTRL updateRole ID: ${req.params.id}] Error:`, error.message, error.stack ? error.stack.substring(0,200) : '');
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al actualizar el rol.' });
  }
};

const deleteRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const roleId = req.params.id;
    await roleService.deleteRole(roleId);
    res.status(200).json({ message: "Rol eliminado exitosamente." });
  } catch (error) {
    console.error(`[CTRL deleteRole ID: ${req.params.id}] Error:`, error.message);
    res.status(error.statusCode || (error.message.toLowerCase().includes("no se puede eliminar") ? 409 : 500) ).json({ message: error.message });
  }
};

const toggleRoleStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const roleId = req.params.id;
    const { status } = req.body;
    if (typeof status !== 'boolean') {
      return res.status(400).json({ message: "El campo 'status' es requerido y debe ser true o false." });
    }
    console.log(`[CTRL toggleRoleStatus ID: ${roleId}] Nuevo estado solicitado:`, status);
    const updatedRole = await roleService.toggleRoleStatus(roleId, status);
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error(`[CTRL toggleRoleStatus ID: ${req.params.id}] Error:`, error.message, error.stack ? error.stack.substring(0,200) : '');
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al cambiar el estado del rol.' });
  }
};

module.exports = {
  createRole, getAllRoles, getRoleById, updateRole, deleteRole, toggleRoleStatus
};