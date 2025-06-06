// src/middlewares/serviceValidations.js
const { body, param } = require('express-validator');
const { Service } = require('../modelos/associations'); // No se usa Op aquí directamente

const validateServiceExistence = async (id, { paranoid = true } = {}) => {
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId) || serviceId <= 0) return;
    const service = await Service.unscoped().findByPk(serviceId, { paranoid });
    if (!service) throw new Error(`El servicio con ID ${serviceId} no existe.`);
    return true;
};

const serviceBodyValidation = [
    body('nombre').trim().notEmpty().withMessage('El nombre del servicio es obligatorio.')
        .isString().withMessage('El nombre del servicio debe ser texto.')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del servicio debe tener entre 3 y 100 caracteres.'),
    body('descripcion').optional({ checkFalsy: true }).trim().isString().withMessage('La descripción debe ser texto.')
        .isLength({ max: 5000 }).withMessage('La descripción no puede exceder los 5000 caracteres.'),
    body('precio') // Añadido para validar el precio si se envía
        .optional({ checkFalsy: true }) // Hacerlo opcional
        .isDecimal({ decimal_digits: '0,2' }).withMessage('El precio debe ser un número decimal (ej: 25.50).')
        .toFloat()
        .isFloat({ min: 0 }).withMessage('El precio no puede ser negativo.'),
    body('imagen').custom((value, { req }) => { return true; }), // Placeholder, Multer maneja esto
    body('status').optional().isBoolean().withMessage('El estado debe ser un valor booleano (true o false).').toBoolean()
];
const createServiceValidation = [ ...serviceBodyValidation ];
const updateServiceValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del servicio en la URL debe ser un número entero positivo.')
    .custom((id) => validateServiceExistence(id, { paranoid: false })),
  body('nombre').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.')
    .isString().withMessage('El nombre del servicio debe ser texto.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('descripcion').optional({ nullable: true, checkFalsy: true }).trim().isString().withMessage('La descripción debe ser texto.')
    .isLength({ max: 5000 }).withMessage('La descripción no puede exceder los 5000 caracteres.'),
  body('precio').optional({ checkFalsy: true })
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El precio debe ser un número decimal (ej: 25.50).')
    .toFloat().isFloat({ min: 0 }).withMessage('El precio no puede ser negativo.'),
  body('status').not().exists().withMessage('El estado del servicio se gestiona a través de la ruta PATCH /:id/status.')
  // body('status').optional().isBoolean().withMessage('El estado debe ser un valor booleano (true o false).').toBoolean()
];
const serviceIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del servicio debe ser un número entero positivo.')
    .custom((id) => validateServiceExistence(id, { paranoid: false }))
];

module.exports = { createServiceValidation, updateServiceValidation, serviceIdValidation, serviceBodyValidation };