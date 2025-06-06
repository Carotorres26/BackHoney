// src/middlewares/specimenCategoryValidations.js
const { body, param } = require('express-validator');
const { SpecimenCategory, Specimen, Op } = require('../modelos/associations');

const VALID_ESTADOS_CATEGORIA = ['activo', 'inactivo'];

const validateUniqueSpecimenCategoryName = async (name, { req }) => {
    if (!name) return true;
    const trimmedName = name.trim();
    const whereCondition = { name: trimmedName };
    const categoryIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (categoryIdToExclude && !isNaN(categoryIdToExclude)) {
        whereCondition.id = { [Op.ne]: categoryIdToExclude };
    }
    const existingCategory = await SpecimenCategory.unscoped().findOne({ where: whereCondition });
    if (existingCategory) {
        throw new Error(`El nombre de categoría '${trimmedName}' ya está en uso.`);
    }
    return true;
};
const validateSpecimenCategoryExistence = async (id) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId) || categoryId <= 0) return;
    const category = await SpecimenCategory.unscoped().findByPk(categoryId);
    if (!category) throw new Error(`La categoría de ejemplar con ID ${categoryId} no existe.`);
    return true;
};
const checkIfCategoryHasSpecimens = async (id) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) return;
    const count = await Specimen.unscoped().count({ where: { specimenCategoryId: categoryId } });
    if (count > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${count} ejemplar(es) asociado(s). Considere desactivarla en su lugar.`);
    }
    return true;
};

const createSpecimenCategoryValidation = [
    body('name').trim().notEmpty().withMessage('El nombre de la categoría es requerido.')
        .isString().withMessage('El nombre de la categoría debe ser texto.')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la categoría debe tener entre 3 y 100 caracteres.')
        .custom(validateUniqueSpecimenCategoryName),
    body('estado').optional().trim().isIn(VALID_ESTADOS_CATEGORIA).withMessage(`El estado debe ser uno de: ${VALID_ESTADOS_CATEGORIA.join(', ')}.`)
];
const updateSpecimenCategoryValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la categoría en la URL no es válido.')
      .custom(validateSpecimenCategoryExistence),
    body('name').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.')
        .isString().withMessage('El nombre de la categoría debe ser texto.')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la categoría debe tener entre 3 y 100 caracteres.')
        .custom(validateUniqueSpecimenCategoryName),
    body('estado').not().exists().withMessage('El estado no se puede modificar directamente por esta ruta. Use la ruta PATCH /:id/status.'),
];
const deleteSpecimenCategoryValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la categoría no es válido.').bail()
        .custom(validateSpecimenCategoryExistence).bail()
        .custom(checkIfCategoryHasSpecimens),
];
const getSpecimenCategoryByIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la categoría no es válido.')
        .custom(validateSpecimenCategoryExistence),
];
const updateSpecimenCategoryStatusValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID de la categoría no es válido.')
        .custom(validateSpecimenCategoryExistence),
    body('estado').trim().notEmpty().withMessage('El nuevo estado es requerido (activo o inactivo).')
        .isIn(VALID_ESTADOS_CATEGORIA).withMessage(`El estado solo puede ser: ${VALID_ESTADOS_CATEGORIA.join(', ')}.`)
];

module.exports = { createSpecimenCategoryValidation, updateSpecimenCategoryValidation, deleteSpecimenCategoryValidation, getSpecimenCategoryByIdValidation, updateSpecimenCategoryStatusValidation };