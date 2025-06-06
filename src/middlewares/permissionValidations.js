// src/middlewares/permissionValidations.js
const { body, param } = require('express-validator');
const { Permission } = require('../modelos/associations'); // Ajusta ruta
const { Op } = require('sequelize'); // Necesario para validación de unicidad al actualizar

const validatePermissionExistence = async (id, { req }) => { // req es opcional aquí
  const permissionId = parseInt(id, 10);
  if (isNaN(permissionId) || permissionId <= 0) {
    throw new Error('El ID del permiso debe ser un número entero positivo.');
  }
  const permission = await Permission.findByPk(permissionId);
  if (!permission) {
    throw new Error('El permiso especificado no existe.');
  }
  // if (req) req.foundPermission = permission; // Opcional: adjuntar al request
  return true;
};

const validateUniquePermissionName = async (name, { req }) => {
  if (!name || typeof name !== 'string') return true;
  const trimmedName = name.trim();
  if (!trimmedName) return true;

  const whereCondition = { name: trimmedName };
  const permissionIdToExclude = req.params?.id ? parseInt(req.params.id, 10) : null; // Usar req.params?.id

  if (permissionIdToExclude && !isNaN(permissionIdToExclude)) {
    whereCondition.id = { [Op.ne]: permissionIdToExclude };
  }

  const existingPermission = await Permission.findOne({ where: whereCondition });
  if (existingPermission) {
    throw new Error(`El nombre de permiso '${trimmedName}' ya existe.`);
  }
  return true;
};

const createPermissionValidation = [
  body('name')
     .trim()
     .notEmpty().withMessage('El nombre del permiso es requerido.')
     .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.')
     // Ejemplo de regex para nombres de permisos tipo 'accion_recurso'
     .matches(/^[a-z0-9_]+$/).withMessage('El nombre del permiso solo puede contener letras minúsculas, números y guiones bajos.')
     .custom((value, { req }) => validateUniquePermissionName(value, { req }))
  // 'description' es opcional
 //  body('description').optional().trim().isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.')
];

const updatePermissionValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del permiso en la URL debe ser un entero positivo.')
    .custom((value, { req }) => validatePermissionExistence(value, { req })),
  body('name')
    .optional() // El nombre puede no venir si solo se actualiza otra cosa (ej. description)
    .trim()
    .notEmpty().withMessage('Si se envía, el nombre del permiso no puede estar vacío.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.')
    .matches(/^[a-z0-9_]+$/).withMessage('El nombre del permiso solo puede contener letras minúsculas, números y guiones bajos.')
    .custom((value, { req }) => validateUniquePermissionName(value, { req })), // req para el contexto de id
 //  body('description').optional({nullable: true}).trim().isLength({ max: 255 }).withMessage('La descripción no debe exceder los 255 caracteres.')
];

const permissionIdParamValidation = [ // Para GET por ID y DELETE
  param('id').isInt({ gt: 0 }).withMessage('El ID del permiso debe ser un número entero positivo.')
    .custom((value, { req }) => validatePermissionExistence(value, { req }))
];

module.exports = {
  createPermissionValidation,
  updatePermissionValidation,
  permissionIdParamValidation // Combinamos get y delete aquí
};