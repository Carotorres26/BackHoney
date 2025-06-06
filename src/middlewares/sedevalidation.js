// src/middlewares/sedeValidations.js
const { body, param } = require('express-validator');
const { Sede, Op } = require('../modelos/associations');

const validateUniqueSedeName = async (NombreSede, { req }) => {
    if (!NombreSede) return true;
    const trimmedName = NombreSede.trim();
    const whereCondition = { NombreSede: trimmedName };
    const sedeIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (sedeIdToExclude && !isNaN(sedeIdToExclude)) {
        whereCondition.id = { [Op.ne]: sedeIdToExclude };
    }
    const existingSede = await Sede.findOne({ where: whereCondition });
    if (existingSede) {
        throw new Error(`Ya existe una sede registrada con el nombre '${trimmedName}'.`);
    }
    return true;
};
const validateSedeExistence = async (id) => {
    const sedeId = parseInt(id, 10);
    if (isNaN(sedeId) || sedeId <= 0) return;
    const sede = await Sede.findByPk(sedeId);
    if (!sede) throw new Error(`La sede con ID ${id} no existe.`);
    return true;
};

const createSedeValidation = [
    body('NombreSede').trim().notEmpty().withMessage('El nombre de la sede es obligatorio.')
        .isString().withMessage('El nombre de la sede debe ser texto.')
        .isLength({ min: 3, max: 255 }).withMessage('El nombre de la sede debe tener entre 3 y 255 caracteres.')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,'-_]+$/)
        .withMessage("El nombre de la sede contiene caracteres no permitidos. Use letras, números, espacios y .,'-_")
        .custom(validateUniqueSedeName),
    body('direccion').optional({ checkFalsy: true }).trim().isString().withMessage('La dirección debe ser texto.')
        .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres.'),
    body('ciudad').optional({ checkFalsy: true }).trim().isString().withMessage('La ciudad debe ser texto.')
        .isLength({ min: 3, max: 100 }).withMessage('La ciudad debe tener entre 3 y 100 caracteres.')
];
const updateSedeValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la sede en la URL debe ser un entero positivo.')
        .custom(validateSedeExistence),
    body('NombreSede').optional().trim().notEmpty().withMessage('Si actualiza el nombre de la sede, no puede estar vacío.')
        .isString().withMessage('El nombre de la sede debe ser texto.')
        .isLength({ min: 3, max: 255 }).withMessage('El nombre de la sede debe tener entre 3 y 255 caracteres.')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,'-_]+$/)
        .withMessage("El nombre de la sede contiene caracteres no permitidos. Use letras, números, espacios y .,'-_")
        .custom(validateUniqueSedeName),
    body('direccion').optional({ checkFalsy: true }).trim().isString().withMessage('La dirección debe ser texto.')
        .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres.'),
    body('ciudad').optional({ checkFalsy: true }).trim().isString().withMessage('La ciudad debe ser texto.')
        .isLength({ min: 3, max: 100 }).withMessage('La ciudad debe tener entre 3 y 100 caracteres.')
];
const sedeIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la sede debe ser un entero positivo.')
        .custom(validateSedeExistence)
];

module.exports = { createSedeValidation, updateSedeValidation, sedeIdValidation };