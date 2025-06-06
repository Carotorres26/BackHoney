// src/controladores/permissionController.js
const { validationResult } = require('express-validator');
const permissionService = require('../servicios/permissionService'); // Ajusta la ruta

const createPermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const permission = await permissionService.createPermission(req.body); // req.body puede tener name y description
    res.status(201).json(permission);
  } catch (error) {
    console.error("[CTRL createPermission] Error:", error.message);
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al crear el permiso.' });
  }
};

const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            order: [['name', 'ASC']],
            attributes: ['id', 'name'] // <--- SOLO id Y name
        });
        res.status(200).json(permissions);
    } catch (error) {
        console.error("Error en permissionController.getAllPermissions:", error);
        res.status(500).json({ message: error.message || 'Error al obtener la lista de permisos.' });
    }
};

const getPermissionById = async (req, res) => {
  const errors = validationResult(req); // Para el param('id')
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    res.status(200).json(permission);
  } catch (error) {
    console.error(`[CTRL getPermissionById ID: ${req.params.id}] Error:`, error.message);
    res.status(error.statusCode || (error.message.toLowerCase().includes("no encontrado") ? 404 : 500)).json({ message: error.message });
  }
};

const updatePermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedResult = await permissionService.updatePermission(req.params.id, req.body);
    // Si el servicio devuelve el objeto actualizado
    // res.status(200).json(updatedResult);
    // Si solo devuelve conteo o éxito/fallo:
    if(updatedResult.affectedRows > 0 || updatedResult.id){ // Si el servicio devolvió el objeto o conteo
         const updatedPermission = await permissionService.getPermissionById(req.params.id); // Recargar para devolver actualizado
         return res.status(200).json({ message: "Permiso actualizado.", permission: updatedPermission});
    }
    // Si no se afectaron filas pero no hubo error (podría ser que los datos eran los mismos)
    return res.status(200).json({ message: "Permiso no modificado (datos idénticos o no encontrado).", permission: await permissionService.getPermissionById(req.params.id) });

  } catch (error) {
    console.error(`[CTRL updatePermission ID: ${req.params.id}] Error:`, error.message);
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al actualizar el permiso.' });
  }
};

const deletePermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await permissionService.deletePermission(req.params.id);
    res.status(200).json({ message: "Permiso eliminado exitosamente." }); // O 204 si no devuelves cuerpo
  } catch (error) {
    console.error(`[CTRL deletePermission ID: ${req.params.id}] Error:`, error.message);
    res.status(error.statusCode || (error.message.toLowerCase().includes("no encontrado") ? 404 : 500)).json({ message: error.message });
  }
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};