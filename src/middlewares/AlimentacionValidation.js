// src/middlewares/AlimentacionValidation.js
const { body, param } = require('express-validator');
const { Alimentacion, Specimen, Op } = require('../modelos/associations');

const VALID_ESTADOS = ['Programado', 'Administrado', 'Cancelado'];

const validateSpecimenExists = async (specimenId) => {
    if (!specimenId) return;
    const id = parseInt(specimenId, 10);
    if (isNaN(id) || id <= 0) throw new Error('El ID del espécimen debe ser un número entero positivo.');
    const specimen = await Specimen.findByPk(id);
    if (!specimen) {
        throw new Error(`El espécimen con ID ${id} no existe.`);
    }
    return true;
};

const validateUniqueAlimentacionForSpecimen = async (nombreAlimento, { req }) => {
    const specimenId = req.body.specimenId || req.params.specimenId;
    const alimentacionIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (!nombreAlimento || !specimenId) return true;
    const parsedSpecimenId = parseInt(specimenId, 10);
    if (isNaN(parsedSpecimenId)) return true;
    const whereCondition = {
        nombreAlimento: nombreAlimento.trim(),
        specimenId: parsedSpecimenId,
    };
    if (alimentacionIdToExclude) {
        whereCondition.id = { [Op.ne]: alimentacionIdToExclude };
    }
    const existing = await Alimentacion.findOne({ where: whereCondition });
    if (existing) {
        throw new Error(`Este alimento ('${nombreAlimento}') ya está registrado para el espécimen ID ${specimenId}.`);
    }
    return true;
};

const createAlimentacionValidation = [
  body('nombreAlimento')
    .trim().notEmpty().withMessage('El nombre del alimento es requerido.')
    .isString().withMessage('El nombre del alimento debe ser texto.')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre del alimento debe tener entre 2 y 255 caracteres.')
    .custom(validateUniqueAlimentacionForSpecimen),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida.')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero igual o mayor a 1.'),
  body('estado')
    .optional().isIn(VALID_ESTADOS).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS.join(', ')}.`),
  body('specimenId')
    .notEmpty().withMessage('El ID del espécimen es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un número entero positivo.')
    .custom(validateSpecimenExists).toInt()
];
const updateAlimentacionValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID de la alimentación en la URL debe ser un entero positivo.')
    .toInt()
    .custom(async (id) => {
        const alimentacion = await Alimentacion.findByPk(id);
        if (!alimentacion) throw new Error(`El registro de alimentación con ID ${id} no existe.`);
        return true;
    }),
  body('nombreAlimento').optional().trim().notEmpty().withMessage('Si actualiza el nombre del alimento, no puede estar vacío.')
    .isString().withMessage('El nombre del alimento debe ser texto.')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre del alimento debe tener entre 2 y 255 caracteres.')
    .custom(validateUniqueAlimentacionForSpecimen),
  body('cantidad').optional().isInt({ min: 1 }).withMessage('Si actualiza la cantidad, debe ser un número entero igual o mayor a 1.'),
  body('estado').optional()
    .custom((value, { req }) => { return true; }), // No validar aquí, se hace en su propia ruta
  body('specimenId').not().exists().withMessage('No se permite modificar el espécimen asociado a este registro de alimentación.')
];
const alimentacionIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID de la alimentación debe ser un entero positivo.')
    .custom(async (id) => {
        const alimentacion = await Alimentacion.findByPk(id);
        if (!alimentacion) throw new Error(`El registro de alimentación con ID ${id} no existe.`);
        return true;
    }).toInt()
];
const validateEstadoUpdate = [
  param('id').isInt({ gt: 0 }).withMessage('El ID de la alimentación debe ser un entero positivo.')
    .custom(async (id) => {
        const alimentacion = await Alimentacion.findByPk(id);
        if (!alimentacion) throw new Error(`El registro de alimentación con ID ${id} no existe.`);
        return true;
    }),
  body('estado').notEmpty().withMessage('El campo estado es requerido para esta operación.')
    .isIn(VALID_ESTADOS).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS.join(', ')}`)
];
const validateSpecimenIdParam = [
  param('specimenId').isInt({ gt: 0 }).withMessage('El ID del espécimen en la URL debe ser un entero positivo.')
    .custom(validateSpecimenExists).toInt()
];

module.exports = {
  createAlimentacionValidation,
  updateAlimentacionValidation,
  alimentacionIdValidation,
  validateEstadoUpdate,
  validateSpecimenIdParam
};