// src/middlewares/VacunacionValidation.js
const { body, param } = require('express-validator');
const { Vacunacion, Specimen, Op } = require('../modelos/associations');

const validateSpecimenExists = async (specimenId) => {
    if (!specimenId) return;
    const id = parseInt(specimenId, 10);
    if (isNaN(id) || id <= 0) throw new Error('El ID del espécimen debe ser un número entero positivo.');
    const specimen = await Specimen.findByPk(id);
    if (!specimen) throw new Error(`El espécimen con ID ${id} no existe.`);
    return true;
};
const validateVacunacionExistence = async (id) => {
    const vacunacionId = parseInt(id, 10);
    if (isNaN(vacunacionId) || vacunacionId <= 0) return;
    const vacunacion = await Vacunacion.findByPk(vacunacionId);
    if (!vacunacion) throw new Error(`El registro de vacunación con ID ${vacunacionId} no existe.`);
    return true;
};
const validateUniqueVacunacionForSpecimen = async (nombreVacuna, { req }) => {
    const specimenId = req.body.specimenId || req.params.specimenId;
    const vacunacionIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (!nombreVacuna || !specimenId) return true;
    const trimmedNombreVacuna = nombreVacuna.trim();
    const parsedSpecimenId = parseInt(specimenId, 10);
    if (isNaN(parsedSpecimenId)) return true;
    const whereCondition = {
        nombreVacuna: trimmedNombreVacuna,
        specimenId: parsedSpecimenId,
    };
    if (vacunacionIdToExclude) {
        whereCondition.id = { [Op.ne]: vacunacionIdToExclude };
    }
    const existing = await Vacunacion.findOne({ where: whereCondition });
    if (existing) {
        throw new Error(`La vacuna '${trimmedNombreVacuna}' ya está registrada para el espécimen ID ${specimenId}.`);
    }
    return true;
};

const createVacunacionValidation = [
  body('nombreVacuna').trim().notEmpty().withMessage('El nombre de la vacuna es requerido.')
    .isString().withMessage('El nombre de la vacuna debe ser texto.')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre de la vacuna debe tener entre 2 y 150 caracteres.')
    .custom(validateUniqueVacunacionForSpecimen),
  body('fechaAdministracion').trim().notEmpty().withMessage('La fecha de administración es requerida.')
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de administración debe tener el formato AAAA-MM-DD.')
    .toDate().custom((value) => { if (value > new Date()) throw new Error('La fecha de administración no puede ser una fecha futura.'); return true; }),
  body('specimenId').notEmpty().withMessage('El ID del espécimen es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un número entero positivo.')
    .custom(validateSpecimenExists).toInt(),
  body('proximaDosisFecha').optional({ nullable: true, checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de próxima dosis debe tener el formato AAAA-MM-DD.')
    .toDate().custom((value, { req }) => {
        if (value && req.body.fechaAdministracion) {
            const fechaAdmin = new Date(req.body.fechaAdministracion);
            if (value <= fechaAdmin) throw new Error('La fecha de la próxima dosis debe ser posterior a la fecha de administración.');
        } return true;
    }),
  body('loteVacuna').optional({ checkFalsy: true }).trim().isString().withMessage('El lote de la vacuna debe ser texto.')
    .isLength({ max: 50 }).withMessage('El lote de la vacuna no puede exceder los 50 caracteres.'),
  body('veterinarioAdmin').optional({ checkFalsy: true }).trim().isString().withMessage('El nombre del veterinario debe ser texto.')
    .isLength({ max: 100 }).withMessage('El nombre del veterinario no puede exceder los 100 caracteres.')
];
const updateVacunacionValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del registro de vacunación en la URL debe ser un entero positivo.')
    .custom(validateVacunacionExistence),
  body('nombreVacuna').optional().trim().notEmpty().withMessage('Si actualiza el nombre de la vacuna, no puede estar vacío.')
    .isString().withMessage('El nombre de la vacuna debe ser texto.')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre de la vacuna debe tener entre 2 y 150 caracteres.')
    .custom(validateUniqueVacunacionForSpecimen),
  body('fechaAdministracion').optional().trim().notEmpty().withMessage('Si actualiza la fecha de administración, no puede estar vacía.')
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de administración debe tener el formato AAAA-MM-DD.')
    .toDate().custom((value) => { if (value && value > new Date()) throw new Error('La fecha de administración no puede ser una fecha futura.'); return true; }),
  body('specimenId').not().exists().withMessage('No se permite modificar el espécimen asociado a este registro de vacunación.'),
  body('proximaDosisFecha').optional({ nullable: true, checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de próxima dosis debe tener el formato AAAA-MM-DD.')
    .toDate().custom(async (value, { req }) => {
        if (value) {
            let fechaAdminStr = req.body.fechaAdministracion;
            if (!fechaAdminStr) {
                const vacunacion = await Vacunacion.findByPk(req.params.id);
                if (vacunacion) fechaAdminStr = vacunacion.fechaAdministracion;
            }
            if (fechaAdminStr) {
                const fechaAdmin = new Date(fechaAdminStr);
                if (value <= fechaAdmin) throw new Error('La fecha de la próxima dosis debe ser posterior a la fecha de administración.');
            }
        } return true;
    }),
  body('loteVacuna').optional({ checkFalsy: true }).trim().isString().isLength({ max: 50 }),
  body('veterinarioAdmin').optional({ checkFalsy: true }).trim().isString().isLength({ max: 100 })
];
const vacunacionIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del registro de vacunación debe ser un entero positivo.')
    .custom(validateVacunacionExistence).toInt()
];
const validateSpecimenIdParamForList = [
  param('specimenId').isInt({ gt: 0 }).withMessage('El ID del espécimen en la URL debe ser un entero positivo.')
    .custom(validateSpecimenExists).toInt()
];

module.exports = { createVacunacionValidation, updateVacunacionValidation, vacunacionIdValidation, validateSpecimenIdParamForList };