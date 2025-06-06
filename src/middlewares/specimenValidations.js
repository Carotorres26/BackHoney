// src/middlewares/specimenValidations.js
const { body, param } = require('express-validator');
const { Specimen, SpecimenCategory, Sede, Client, Contract, Op } = require('../modelos/associations');
const { validate: uuidValidate } = require('uuid');

const validateEntityExistsByPk = async (model, id, entityName, options = {}) => {
    if (id === null || id === undefined || id === '') return true;
    const parsedId = parseInt(id, 10);
    if ( (model !== Specimen && (isNaN(parsedId) || parsedId <= 0)) || (model === Specimen && isNaN(parsedId)) ) {
         throw new Error(`El ID de ${entityName} no es válido.`);
    }
    const entity = await model.unscoped().findByPk(parsedId, options.scopes ? options : { ...options, scope: null });
    if (!entity) throw new Error(`El/La ${entityName} con ID ${parsedId} no existe.`);
    if (model === SpecimenCategory && entity.estado !== 'activo') {
        throw new Error(`La categoría de ejemplar '${entity.name}' (ID ${parsedId}) está inactiva y no se puede asignar.`);
    }
    return true;
};
const validateSpecimenExistence = (id) => validateEntityExistsByPk(Specimen, id, 'ejemplar');
const validateSpecimenCategoryIdExistsAndActive = (id) => validateEntityExistsByPk(SpecimenCategory, id, 'categoría de ejemplar');
const validateSedeIdExists = (id) => validateEntityExistsByPk(Sede, id, 'sede');
const validateClientIdExists = (id) => validateEntityExistsByPk(Client, id, 'cliente');
const validateContractIdExists = async (contractId) => {
    if (contractId === null || contractId === undefined || contractId === '') return true;
    return validateEntityExistsByPk(Contract, contractId, 'contrato');
};
const validateUniqueIdentifier = async (identifier, { req }) => {
    if (!identifier) return true;
    if (!uuidValidate(identifier)) {
        throw new Error('El identificador proporcionado no tiene un formato UUID válido.');
    }
    const whereCondition = { identifier: identifier };
    const specimenIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (specimenIdToExclude && !isNaN(specimenIdToExclude)) {
        whereCondition.id = { [Op.ne]: specimenIdToExclude };
    }
    const existingSpecimen = await Specimen.unscoped().findOne({ where: whereCondition });
    if (existingSpecimen) {
        throw new Error(`Este identificador UUID ya está en uso por otro ejemplar.`);
    }
    return true;
};

const createSpecimenValidation = [
  body('name').trim().notEmpty().withMessage('El nombre del ejemplar es requerido.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres.'),
  body('breed').optional({ checkFalsy: true }).trim().isString().withMessage('La raza debe ser texto.')
    .isLength({ max: 100 }).withMessage('La raza no puede exceder los 100 caracteres.'),
  body('color').optional({ checkFalsy: true }).trim().isString().withMessage('El color debe ser texto.')
    .isLength({ max: 50 }).withMessage('El color no puede exceder los 50 caracteres.'),
  body('birthDate').optional({ nullable: true, checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha de nacimiento debe tener el formato AAAA-MM-DD o dejarse vacía.')
    .toDate().custom((value) => { if (value && value > new Date()) throw new Error('La fecha de nacimiento no puede ser una fecha futura.'); return true; }),
  body('clientId').notEmpty().withMessage('El ID del cliente (dueño) es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un número entero positivo.').custom(validateClientIdExists),
  body('specimenCategoryId').notEmpty().withMessage('El ID de la categoría del ejemplar es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID de la categoría debe ser un número entero positivo.').custom(validateSpecimenCategoryIdExistsAndActive),
  body('identifier').optional({ checkFalsy: true }).trim().custom(validateUniqueIdentifier),
  body('sedeId').optional({ nullable: true, checkFalsy: true })
    .isInt({ gt: 0 }).withMessage('Si se proporciona, el ID de la sede debe ser un número entero positivo.').custom(validateSedeIdExists),
  body('contractId').optional({ nullable: true, checkFalsy: true })
    .isInt({ gt: 0 }).withMessage('Si se proporciona, el ID del contrato debe ser un número entero positivo.').custom(validateContractIdExists)
];
const updateSpecimenValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del ejemplar en la URL debe ser un entero positivo.').custom(validateSpecimenExistence),
  body('name').optional().trim().notEmpty().withMessage('Si actualiza el nombre, no puede estar vacío.').isLength({ min: 2, max: 150 }),
  body('breed').optional({ nullable: true, checkFalsy: true }).trim().isString().isLength({ max: 100 }),
  body('color').optional({ nullable: true, checkFalsy: true }).trim().isString().isLength({ max: 50 }),
  body('birthDate').optional({ nullable: true, checkFalsy: true }).isISO8601({ strict: true, strictSeparator: true }).toDate()
    .custom((value) => { if (value && value > new Date()) throw new Error('La fecha de nacimiento no puede ser futura.'); return true; }),
  body('clientId').optional().isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un número entero positivo.').custom(validateClientIdExists),
  body('specimenCategoryId').optional().isInt({ gt: 0 }).withMessage('El ID de la categoría debe ser un número entero positivo.').custom(validateSpecimenCategoryIdExistsAndActive),
  body('identifier').optional({ checkFalsy: true }).trim().custom(validateUniqueIdentifier),
  body('sedeId').optional({ nullable: true, checkFalsy: true })
    .custom((value, {req}) => { if (value === null || value === '') return true; if(isNaN(parseInt(value,10)) || parseInt(value,10) <= 0) throw new Error('Si se proporciona, el ID de la sede debe ser un número positivo.'); return validateSedeIdExists(value); }),
  body('contractId').optional({ nullable: true, checkFalsy: true })
    .custom((value, {req}) => { if (value === null || value === '') return true; if(isNaN(parseInt(value,10)) || parseInt(value,10) <= 0) throw new Error('Si se proporciona, el ID del contrato debe ser un número positivo.'); return validateContractIdExists(value); })
];
const specimenIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del ejemplar debe ser un entero positivo.').custom(validateSpecimenExistence)
];
const validateDifferentEntity = async (currentEntityId, newEntityId, entityName) => {
  if (newEntityId === null || newEntityId === undefined || newEntityId === '') return true;
  const newIdParsed = parseInt(newEntityId, 10);
  if (currentEntityId === newIdParsed) return Promise.reject(`El ejemplar ya se encuentra en esta ${entityName.toLowerCase()}.`);
  return true;
};
const moveSpecimenValidation = [
  param('id').isInt({ gt: 0 }).withMessage('El ID del ejemplar debe ser un entero positivo.')
    .custom(async (id, { req }) => {
        const specimen = await Specimen.unscoped().findByPk(id);
        if (!specimen) throw new Error(`El ejemplar con ID ${id} no existe.`);
        req.specimenToMove = specimen; return true;
    }),
  body('specimenCategoryId').optional({ nullable: true, checkFalsy: true })
    .custom(async (newCategoryId, { req }) => {
        if (newCategoryId === undefined) return true;
        if (newCategoryId === null || newCategoryId === '') {
            const modelField = Specimen.getAttributes().specimenCategoryId;
            if (modelField.allowNull === false) throw new Error('No se puede desasociar de la categoría; es un campo requerido.');
            return true;
        }
        const id = parseInt(newCategoryId, 10);
        if (isNaN(id) || id <= 0) throw new Error('El ID de la nueva categoría debe ser un número entero positivo.');
        await validateSpecimenCategoryIdExistsAndActive(id);
        return validateDifferentEntity(req.specimenToMove.specimenCategoryId, id, 'Categoría');
    }),
  body('sedeId').optional({ nullable: true, checkFalsy: true })
    .custom(async (newSedeId, { req }) => {
        if (newSedeId === undefined) return true;
        if (newSedeId === null || newSedeId === '') return true;
        const id = parseInt(newSedeId, 10);
        if (isNaN(id) || id <= 0) throw new Error('El ID de la nueva sede debe ser un número entero positivo.');
        await validateSedeIdExists(id);
        return validateDifferentEntity(req.specimenToMove.sedeId, id, 'Sede');
    }),
  body().custom((value, { req }) => {
    if (req.body.specimenCategoryId === undefined && req.body.sedeId === undefined) {
      throw new Error('Debe proporcionar un nuevo ID de categoría o un nuevo ID de sede para mover el ejemplar.');
    } return true;
  })
];

module.exports = { createSpecimenValidation, updateSpecimenValidation, specimenIdValidation, moveSpecimenValidation };