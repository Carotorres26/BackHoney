// src/middlewares/clientValidations.js
const { body, param } = require('express-validator');
const { Client } = require('../modelos/associations'); // Sigue importando Client desde aquí
const { Op } = require('sequelize'); // ***** CAMBIO CRUCIAL: Importar Op directamente de sequelize *****

const validateUniqueClientField = async (value, { fieldName, friendlyName, req }) => {
    if (!value || typeof value.trim !== 'function' || !value.trim()) { // Añadida verificación para value y trim()
        return true; // No validar si el valor es vacío o no es un string
    }
    const trimmedValue = value.trim();
    const whereCondition = { [fieldName]: trimmedValue };
    const clientIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;

    console.log(`[validateUniqueClientField] Field: ${fieldName}, Value: ${trimmedValue}, Excluding ID: ${clientIdToExclude}`); // Log
    console.log(`[validateUniqueClientField] typeof Op: ${typeof Op}, Op.ne: ${Op ? typeof Op.ne : 'Op is undefined'}`); // Log para Op

    if (clientIdToExclude && !isNaN(clientIdToExclude)) {
        if (Op && Op.ne) { // Verificar que Op y Op.ne existan antes de usarlos
            whereCondition.id = { [Op.ne]: clientIdToExclude };
        } else {
            console.error("[validateUniqueClientField] ¡ERROR CRÍTICO! Op o Op.ne no está definido.");
            // Considera lanzar un error o manejar esto para evitar el crash de la aplicación
            // Por ahora, para la depuración, no aplicaremos la exclusión si Op no está.
            // Esto NO es una solución, solo para ver si el resto funciona.
            // throw new Error("Error interno de configuración de validación: Operadores no disponibles.");
        }
    }

    try {
        const existingClient = await Client.findOne({ where: whereCondition });
        if (existingClient) {
            throw new Error(`El ${friendlyName} '${trimmedValue}' ya está registrado por otro cliente.`);
        }
    } catch (dbError) {
        console.error(`[validateUniqueClientField] Error de base de datos: ${dbError.message}`);
        throw new Error(`Error al verificar unicidad para ${friendlyName}.`); // Lanzar un error más genérico al cliente
    }
    return true;
};

const validateClientExistence = async (id, { req }) => { // Añadido { req } para consistencia, aunque no se use aquí
    const clientId = parseInt(id, 10);
    if (isNaN(clientId) || clientId <= 0) {
        // No lanzar error aquí directamente, express-validator lo hará con el mensaje del `isInt`
        return Promise.reject('ID de cliente inválido.'); // Para que la cadena de promesas de express-validator falle
    }
    const client = await Client.findByPk(clientId);
    if (!client) {
        throw new Error(`El cliente con ID ${id} no existe.`);
    }
    // Opcional: adjuntar cliente a req si se necesita en el controlador directamente
    // req.foundClient = client; 
    return true;
};

// --- Validaciones para CREAR ---
const createClientValidation = [
    body('nombre').trim().notEmpty().withMessage('El nombre del cliente es requerido.')
        .isString().withMessage('El nombre debe ser texto.')
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres.'),
    body('documento').trim().notEmpty().withMessage('El número de documento es requerido.')
        .isString().withMessage('El número de documento debe ser texto.')
        .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres.')
        .custom((value, { req }) => validateUniqueClientField(value, { fieldName: 'documento', friendlyName: 'número de documento', req })),
    body('email').trim().notEmpty().withMessage('El correo electrónico es requerido.')
        .isEmail().withMessage('El formato del correo electrónico no es válido (ej: usuario@dominio.com).')
        .normalizeEmail()
        .custom((value, { req }) => validateUniqueClientField(value, { fieldName: 'email', friendlyName: 'correo electrónico', req })),
    body('celular').trim().notEmpty().withMessage('El número de celular es requerido.')
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.') // Quitado mensaje redundante
        .isLength({ min: 7, max: 15 }).withMessage('El número de celular debe tener entre 7 y 15 dígitos.'),
    // body('ejemplares') ya no está, lo cual es correcto.
];

// --- Validaciones para ACTUALIZAR ---
const updateClientValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del cliente en la URL debe ser un entero positivo.')
        .custom(validateClientExistence), // Ya existe y es un cliente válido

    body('nombre').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.')
        .isString().withMessage('El nombre debe ser texto.')
        .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres.'),
    
    body('documento').optional().trim().notEmpty().withMessage('Si actualiza el número de documento, no puede estar vacío.')
        .isString().withMessage('El número de documento debe ser texto.')
        .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres.')
        .custom((value, { req }) => validateUniqueClientField(value, { fieldName: 'documento', friendlyName: 'número de documento', req })),
    
    body('email').optional().trim().notEmpty().withMessage('Si actualiza el correo electrónico, no puede estar vacío.')
        .isEmail().withMessage('El formato del correo electrónico no es válido.')
        .normalizeEmail()
        .custom((value, { req }) => validateUniqueClientField(value, { fieldName: 'email', friendlyName: 'correo electrónico', req })),
    
    body('celular').optional().trim().notEmpty().withMessage('Si actualiza el celular, no puede estar vacío.')
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.')
        .isLength({ min: 7, max: 15 }).withMessage('El número de celular debe tener entre 7 y 15 dígitos.'),
];

const clientIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un entero positivo.')
        .custom(validateClientExistence)
];

module.exports = { createClientValidation, updateClientValidation, clientIdValidation };