// src/middlewares/roleValidations.js
const { body, param } = require('express-validator');
const { Role, Permission } = require('../modelos/associations'); // Ajusta la ruta a tus modelos
const { Op } = require('sequelize');

// --- Helpers ---
const validateUniqueRoleName = async (name, { req }) => {
    if (!name || typeof name !== 'string') return true; 
    const trimmedName = name.trim();
    if (!trimmedName) return true; 

    const whereCondition = { name: trimmedName };
    const roleIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;

    if (roleIdToExclude && !isNaN(roleIdToExclude)) {
        whereCondition.id = { [Op.ne]: roleIdToExclude }; 
    }

    const existingRole = await Role.unscoped().findOne({ where: whereCondition });
    if (existingRole) {
        throw new Error(`El nombre de rol '${trimmedName}' ya está en uso.`);
    }
    return true;
};

const validateRoleExistence = async (id, { req, paranoid = true } = {}) => {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId) || roleId <= 0) {
        throw new Error(`ID de rol inválido: ${id}.`);
    }
    const role = await Role.unscoped().findByPk(roleId, { paranoid });
    if (!role) {
        throw new Error(`El rol con ID ${id} no existe o no está accesible.`);
    }
    if (req) { 
        req.foundRole = role;
    }
    return true;
};

const validatePermissionNames = async (permissionNamesAsInput) => {
    if (permissionNamesAsInput === undefined || permissionNamesAsInput === null) return true;
    if (!Array.isArray(permissionNamesAsInput)) throw new Error('Los permisos deben ser una lista (array) de nombres.');
    
    // Si la validación principal ya exige que no sea vacío, esta función se enfoca en la validez de los nombres.
    // Si el array puede ser vacío (ej. en update si no se envían permisos), esta función no debe fallar.
    if (permissionNamesAsInput.length === 0) return true;

    for (const name of permissionNamesAsInput) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error(`Nombre de permiso inválido: '${name}'. Debe ser un texto no vacío.`);
        }
    }
    
    const trimmedNames = permissionNamesAsInput.map(name => name.trim());
    const existingPermissions = await Permission.findAll({
        where: {
            name: { [Op.in]: trimmedNames }
        },
        attributes: ['name']
    });

    if (existingPermissions.length !== trimmedNames.length) {
        const foundNames = existingPermissions.map(p => p.name);
        const notFoundNames = trimmedNames.filter(name => !foundNames.includes(name));
        throw new Error(`Uno o más nombres de permisos proporcionados no son válidos o no existen: ${notFoundNames.join(', ')}`);
    }
    return true;
};
// --- Fin Helpers ---

const createRoleValidation = [
  body('name').trim().notEmpty().withMessage('El nombre del rol es obligatorio.')
    .isString().withMessage('El nombre del rol debe ser texto.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres.')
    .matches(/^[a-zA-Z0-9_ ÁÉÍÓÚáéíóúñÑ-]+$/).withMessage('Nombre de rol: solo letras, números, espacios, guiones y guiones bajos.')
    .custom(validateUniqueRoleName),
  body('status').optional().isBoolean().withMessage('El estado debe ser un valor booleano (true o false).').toBoolean(),
  body('permissions')
    .notEmpty().withMessage('Debe asignar al menos un permiso al rol.') // Exige que el campo 'permissions' exista y no esté vacío
    .isArray({ min: 1 }).withMessage('Debe seleccionar al menos un permiso y debe ser una lista con al menos un elemento.') // Exige array con al menos 1 elemento
    .custom(validatePermissionNames) // Valida los nombres si el array tiene elementos
];

const updateRoleValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del rol en la URL debe ser un número entero positivo.')
    .custom((id, {req}) => validateRoleExistence(id, { req, paranoid: false })),
  body('name').optional().trim().notEmpty().withMessage('Si actualiza el nombre del rol, no puede estar vacío.')
    .isString().withMessage('El nombre del rol debe ser texto.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre del rol debe tener entre 3 y 50 caracteres.')
    .matches(/^[a-zA-Z0-9_ ÁÉÍÓÚáéíóúñÑ-]+$/).withMessage('Nombre de rol: solo letras, números, espacios, guiones y guiones bajos.')
    .custom(validateUniqueRoleName),
  body('status').not().exists().withMessage('El estado del rol se gestiona a través de la ruta PATCH /:id/status y no debe enviarse aquí.'),
  body('permissions')
    .optional() // Permite no enviar 'permissions' si no se quieren modificar los existentes
    .isArray().withMessage('Si se envían, los permisos deben ser una lista (array).')
    // Si el campo 'permissions' SÍ se incluye en el body (indicando intención de modificar),
    // entonces no puede ser un array vacío.
    .custom((value, { req }) => { 
        if (req.body.hasOwnProperty('permissions')) { // Solo si 'permissions' está explícitamente en el body
            if (!Array.isArray(value) || value.length === 0) { 
                throw new Error('Si decide modificar los permisos, la lista no puede quedar vacía. Asigne al menos un permiso o no incluya el campo "permissions" en la petición para mantener los actuales.');
            }
        }
        return true;
    })
    // Validar los nombres solo si el array 'permissions' se envió y tiene al menos un elemento.
    // La validación custom anterior ya asegura que si 'permissions' se envía, no esté vacío.
    // Así que aquí solo necesitamos validar los nombres si el array existe y tiene contenido.
    .if(body('permissions').isArray({ min: 1 })) 
    .custom(validatePermissionNames)
];

const roleIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo.')
    .custom((id, {req}) => validateRoleExistence(id, { req, paranoid: false }))
];

const toggleRoleStatusValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo.')
        .custom((id, {req}) => validateRoleExistence(id, { req, paranoid: false })),
    body('status').exists({ checkFalsy: false }).withMessage('El campo status es requerido (true o false).')
        .isBoolean().withMessage('El campo status debe ser true o false.')
        .toBoolean()
];

module.exports = { 
    createRoleValidation, 
    updateRoleValidation, 
    roleIdParamValidation,
    toggleRoleStatusValidation 
};