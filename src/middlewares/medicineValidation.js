// src/middlewares/medicineValidation.js
const { body, param } = require('express-validator');
const { Medicine, Specimen, Op } = require('../modelos/associations');

const VALID_ESTADOS_MEDICINA = ['Programado', 'Administrado', 'Cancelado'];
const validateSpecimenExists = async (specimenId) => {
    if (!specimenId) return;
    const id = parseInt(specimenId, 10);
    if (isNaN(id) || id <= 0) throw new Error('El ID del espécimen debe ser un número entero positivo.');
    const specimen = await Specimen.findByPk(id);
    if (!specimen) throw new Error(`El espécimen con ID ${id} no existe.`);
    return true;
};
const validateUniqueMedicineForSpecimen = async (nombre, { req }) => {
    const specimenId = req.body.specimenId || req.params.specimenId;
    const medicineIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (!nombre || !specimenId) return true;
    const parsedSpecimenId = parseInt(specimenId, 10);
    if (isNaN(parsedSpecimenId)) return true;
    const whereCondition = {
        nombre: nombre.trim(),
        specimenId: parsedSpecimenId,
    };
    if (medicineIdToExclude) {
        whereCondition.id = { [Op.ne]: medicineIdToExclude };
    }
    const existing = await Medicine.findOne({ where: whereCondition });
    if (existing) {
        throw new Error(`Este medicamento ('${nombre}') ya está registrado para el espécimen ID ${specimenId}.`);
    }
    return true;
};

const medicineCreateValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre del medicamento es requerido.')
    .isString().withMessage('El nombre del medicamento debe ser texto.')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre del medicamento debe tener entre 2 y 255 caracteres.')
    .custom(validateUniqueMedicineForSpecimen),
  body('cantidad').notEmpty().withMessage('La cantidad es requerida.')
    .isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero igual o mayor a cero (0 para "según necesidad", por ejemplo).'),
  body('dosis').trim().notEmpty().withMessage('La dosis es requerida.')
    .isString().withMessage('La dosis debe ser texto.')
    .isLength({ min: 1, max: 100 }).withMessage('La dosis debe tener entre 1 y 100 caracteres.'),
  body('horaAdministracion').trim().notEmpty().withMessage('La hora de administración es requerida.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('La hora de administración debe tener el formato HH:MM o HH:MM:SS (ej: 09:30 o 09:30:00).'),
  body('estado').optional().isIn(VALID_ESTADOS_MEDICINA).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS_MEDICINA.join(', ')}.`),
  body('specimenId').notEmpty().withMessage('El ID del espécimen es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un número entero positivo.')
    .custom(validateSpecimenExists).toInt()
];
const medicineUpdateValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del medicamento en la URL debe ser un entero positivo.')
    .custom(async (id) => {
        const medicine = await Medicine.findByPk(id);
        if (!medicine) throw new Error(`El medicamento con ID ${id} no existe.`);
        return true;
    }),
  body('nombre').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.')
    .isString().withMessage('El nombre del medicamento debe ser texto.')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres.')
    .custom(validateUniqueMedicineForSpecimen),
  body('cantidad').optional().isInt({ min: 0 }).withMessage('Si actualiza la cantidad, debe ser un número entero igual o mayor a 0.'),
  body('dosis').optional().trim().notEmpty().withMessage('Si actualiza la dosis, no puede estar vacía.')
    .isString().withMessage('La dosis debe ser texto.')
    .isLength({ min: 1, max: 100 }).withMessage('La dosis debe tener entre 1 y 100 caracteres.'),
  body('horaAdministracion').optional().trim().notEmpty().withMessage('Si actualiza la hora de administración, no puede estar vacía.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('La hora de administración debe tener el formato HH:MM o HH:MM:SS.'),
  body('estado').optional(),
  body('specimenId').not().exists().withMessage('No se permite modificar el espécimen asociado a este medicamento.')
];
const medicineIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del medicamento debe ser un entero positivo.')
    .custom(async (id) => {
        const medicine = await Medicine.findByPk(id);
        if (!medicine) throw new Error(`El medicamento con ID ${id} no existe.`);
        return true;
    })
];
const validateMedicineEstadoUpdate = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del medicamento debe ser un entero positivo.')
    .custom(async (id) => {
        const medicine = await Medicine.findByPk(id);
        if (!medicine) throw new Error(`El medicamento con ID ${id} no existe.`);
        return true;
    }),
  body('estado').notEmpty().withMessage('El campo estado es requerido para esta operación.')
    .isIn(VALID_ESTADOS_MEDICINA).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS_MEDICINA.join(', ')}`)
];
const validateMedicineSpecimenIdParam = [
  param('specimenId').isInt({ gt: 0 }).withMessage('El ID del espécimen en la URL debe ser un entero positivo.')
    .custom(validateSpecimenExists).toInt()
];

module.exports = { medicineCreateValidation, medicineUpdateValidation, medicineIdValidation, validateMedicineEstadoUpdate, validateMedicineSpecimenIdParam };