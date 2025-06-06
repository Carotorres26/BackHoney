// src/middlewares/contractValidations.js
const { body, param } = require('express-validator');
const { Contract, Client, Service, Specimen, Op } = require('../modelos/associations');

const validateClientExists = async (clientId) => {
    if (clientId === null || clientId === undefined || clientId === '') return true;
    const id = parseInt(clientId, 10);
    if (isNaN(id) || id <= 0) throw new Error('El ID del cliente debe ser un número entero positivo.');
    const client = await Client.findByPk(id);
    if (!client) throw new Error(`El cliente con ID ${id} no existe.`);
    return true;
};
const validateContractExistence = async (contractId) => {
    const id = parseInt(contractId, 10);
    if (isNaN(id) || id <= 0) return;
    const contract = await Contract.findByPk(id);
    if (!contract) throw new Error(`El contrato con ID ${id} no existe.`);
    return true;
};
const validateSpecimenExists = async (specimenId) => {
    if (specimenId === null || specimenId === undefined || specimenId === '') return true;
    const id = parseInt(specimenId, 10);
    if (isNaN(id) || id <= 0) throw new Error('ID de ejemplar inválido.');
    const specimen = await Specimen.findByPk(id);
    if (!specimen) throw new Error('El ejemplar especificado no existe.');
    return true;
};
const validateServiceIds = async (serviceIds) => {
    if (!serviceIds) return true;
    if (!Array.isArray(serviceIds)) throw new Error('Los IDs de servicios deben ser una lista (array).');
    if (serviceIds.length === 0) return true;
    for (const serviceId of serviceIds) {
        const id = parseInt(serviceId, 10);
        if (isNaN(id) || id <= 0) throw new Error(`ID de servicio inválido: ${serviceId}. Debe ser un número positivo.`);
        const service = await Service.findByPk(id);
        if (!service) throw new Error(`El servicio con ID ${id} no existe.`);
    }
    return true;
};
const VALID_ESTADOS_CONTRATO = ['activo', 'finalizado', 'cancelado'];

const createContractValidation = [
    body('fechaInicio').trim().notEmpty().withMessage('La fecha de inicio del contrato es obligatoria.')
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('El formato de la fecha de inicio no es válido. Use AAAA-MM-DD.')
        .toDate().custom((value) => { return true; }),
    body('precioMensual').trim().notEmpty().withMessage('El precio mensual del contrato es obligatorio.')
        .isDecimal({ decimal_digits: '1,2' }).withMessage('El precio mensual debe ser un número decimal con hasta 2 decimales (ej: 150.50).')
        .toFloat().isFloat({ gt: 0 }).withMessage('El precio mensual debe ser un valor positivo mayor que cero.'),
    body('clientId').notEmpty().withMessage('El cliente es obligatorio para el contrato.')
        .isInt({ gt: 0 }).withMessage('El ID del cliente no es válido (debe ser un número entero positivo).')
        .custom(validateClientExists),
    body('estado').optional().trim().isIn(VALID_ESTADOS_CONTRATO).withMessage(`El estado del contrato debe ser uno de: ${VALID_ESTADOS_CONTRATO.join(', ')}.`),
    body('specimenId').optional({nullable: true, checkFalsy: true})
       .isInt({ gt: 0 }).withMessage('Si se proporciona, el ID del ejemplar debe ser un número positivo.')
       .custom(validateSpecimenExists),
    body('serviceIds').optional().isArray().withMessage('Si se proporcionan, los IDs de servicios deben ser una lista (array).')
        .custom(validateServiceIds),
    body('condiciones').optional({ checkFalsy: true }).trim().isString().withMessage('Las condiciones deben ser texto.')
        .isLength({ max: 5000 }).withMessage('Las condiciones son demasiado largas (máximo 5000 caracteres).')
];
const updateContractValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del contrato en la URL no es válido.')
        .custom(validateContractExistence),
    body('fechaInicio').optional().trim().notEmpty().withMessage('Si actualiza la fecha de inicio, no puede estar vacía.')
        .isISO8601({ strict: true, strictSeparator: true }).withMessage('El formato de la fecha de inicio no es válido. Use AAAA-MM-DD.').toDate(),
    body('precioMensual').optional().trim().notEmpty().withMessage('Si actualiza el precio mensual, no puede estar vacío.')
        .isDecimal({ decimal_digits: '1,2' }).withMessage('El precio mensual debe ser un número decimal con hasta 2 decimales.')
        .toFloat().isFloat({ gt: 0 }).withMessage('El precio mensual debe ser un valor positivo mayor que cero.'),
    body('clientId').not().exists().withMessage('El cliente de un contrato no se puede modificar una vez creado.'),
    body('estado').optional().trim().notEmpty().withMessage('Si actualiza el estado, no puede estar vacío.')
        .isIn(VALID_ESTADOS_CONTRATO).withMessage(`El estado del contrato debe ser uno de: ${VALID_ESTADOS_CONTRATO.join(', ')}.`),
    body('specimenId').optional({nullable: true, checkFalsy: true})
       .custom((value, { req }) => {
            if (value === null || value === '') return true;
            if (isNaN(parseInt(value,10)) || parseInt(value,10) <= 0) throw new Error ('Si se proporciona, el ID del ejemplar debe ser un número positivo.');
            return validateSpecimenExists(value);
       }),
    body('serviceIds').optional().isArray().withMessage('Si actualiza los servicios, los IDs deben ser una lista (array).')
        .custom(validateServiceIds),
    body('condiciones').optional({ checkFalsy: true }).trim().isString().withMessage('Las condiciones deben ser texto.')
        .isLength({ max: 5000 }).withMessage('Las condiciones son demasiado largas (máximo 5000 caracteres).')
];
const contractIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del contrato no es válido.')
        .custom(validateContractExistence)
];

module.exports = { createContractValidation, updateContractValidation, contractIdValidation };