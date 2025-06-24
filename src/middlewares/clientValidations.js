// src/middlewares/clientValidations.js
const { body, param } = require('express-validator');
const Client = require('../modelos/client'); // Importamos el modelo para hacer consultas
const { Op } = require('sequelize');

/**
 * Función reutilizable para validar que un campo (documento o email) sea único.
 * Maneja tanto la creación como la actualización (excluyendo el ID actual).
 */
const validateUniqueClientField = async (value, { req }) => {
    // El campo `path` es proporcionado por express-validator y nos dice qué campo se está validando.
    const fieldName = req.path.includes('documento') ? 'documento' : 'email';
    const friendlyName = fieldName === 'documento' ? 'número de documento' : 'correo electrónico';

    if (!value || typeof value.trim !== 'function' || !value.trim()) {
        return true; // No validar si el valor es vacío, lo hará .notEmpty()
    }
    const trimmedValue = value.trim();
    const whereCondition = { [fieldName]: trimmedValue };

    // Si estamos en una ruta de actualización (PUT/PATCH con /:id), excluimos el cliente actual de la búsqueda.
    const clientIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (clientIdToExclude) {
        whereCondition.id = { [Op.ne]: clientIdToExclude };
    }

    const existingClient = await Client.findOne({ where: whereCondition });

    if (existingClient) {
        throw new Error(`El ${friendlyName} '${trimmedValue}' ya está registrado.`);
    }
    return true;
};

/**
 * Función reutilizable para validar que un cliente con un ID dado existe en la base de datos.
 */
const validateClientExistence = async (id) => {
    const client = await Client.findByPk(id);
    if (!client) {
        throw new Error(`El cliente con ID ${id} no existe.`);
    }
    return true;
};

// --- VALIDACIONES PARA CREAR (POST /) ---
const createClientValidation = [
    body('nombre').trim().notEmpty().withMessage('El nombre del cliente es requerido.')
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres.'),

    body('documento').trim().notEmpty().withMessage('El número de documento es requerido.')
        .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres.')
        .custom(validateUniqueClientField),

    body('email').trim().notEmpty().withMessage('El correo electrónico es requerido.')
        .isEmail().withMessage('El formato del correo electrónico no es válido.')
        .normalizeEmail()
        .custom(validateUniqueClientField),

    body('celular').trim().notEmpty().withMessage('El número de celular es requerido.')
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.')
        .isLength({ min: 7, max: 15 }).withMessage('El número de celular debe tener entre 7 y 15 dígitos.'),
];

// --- VALIDACIONES PARA ACTUALIZAR (PUT /:id) ---
const updateClientValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un entero positivo.')
        .custom(validateClientExistence),

    body('nombre').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.')
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres.'),
    
    body('documento').optional().trim().notEmpty().withMessage('Si actualiza el documento, no puede estar vacío.')
        .isLength({ min: 5, max: 20 }).withMessage('El documento debe tener entre 5 y 20 caracteres.')
        .custom(validateUniqueClientField),
    
    body('email').optional().trim().notEmpty().withMessage('Si actualiza el email, no puede estar vacío.')
        .isEmail().withMessage('El formato del correo electrónico no es válido.')
        .normalizeEmail()
        .custom(validateUniqueClientField),
    
    body('celular').optional().trim().notEmpty().withMessage('Si actualiza el celular, no puede estar vacío.')
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.')
        .isLength({ min: 7, max: 15 }).withMessage('El número de celular debe tener entre 7 y 15 dígitos.'),
    
    // Evita que el estado se cambie a través de esta ruta
    body('estado').not().exists().withMessage('El estado del cliente no se puede modificar por esta vía.')
];

// --- VALIDACIÓN PARA RUTAS CON SOLO ID (GET /:id, DELETE /:id) ---
const clientIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un entero positivo.')
        .custom(validateClientExistence)
];

// ---- NUEVA VALIDACIÓN: PARA CAMBIAR EL ESTADO (PATCH /:id/status) ----
const updateClientStatusValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un entero positivo.')
        .custom(validateClientExistence), // Reutilizamos la validación de existencia

    body('estado').trim().notEmpty().withMessage('El campo "estado" es requerido.')
        .isIn(['activo', 'inactivo']).withMessage("El valor de estado solo puede ser 'activo' o 'inactivo'.")
];


module.exports = {
    createClientValidation,
    updateClientValidation,
    clientIdValidation,
    updateClientStatusValidation // Exportamos la nueva validación
};