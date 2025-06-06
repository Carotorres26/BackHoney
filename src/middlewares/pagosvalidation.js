// src/middlewares/pagoValidations.js
const { body, param } = require('express-validator');
const { Pago, Contract, Op } = require('../modelos/associations');

const METODOS_PAGO_VALIDOS = ['efectivo', 'transferencia'];

const validateContractExistsAndIsActive = async (contractId) => {
    if (!contractId) return;
    const id = parseInt(contractId, 10);
    if (isNaN(id) || id <= 0) throw new Error('ID de contrato inválido.');
    const contract = await Contract.findByPk(id);
    if (!contract) throw new Error(`El contrato con ID ${id} no existe.`);
    if (contract.estado !== 'activo') {
        throw new Error(`Solo se pueden registrar pagos para contratos que estén 'activos'. El contrato ID ${id} está '${contract.estado}'.`);
    }
    return true;
};
const validatePagoExistence = async (id_pago) => {
    const id = parseInt(id_pago, 10);
    if (isNaN(id) || id <= 0) return;
    const pago = await Pago.findByPk(id);
    if (!pago) throw new Error(`El pago con ID ${id} no existe.`);
    return true;
};
const validateUniquePagoForContractMonth = async (mesPago, { req }) => {
    const contractId = req.body.contractId;
    const pagoIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    if (!contractId || !mesPago ) return true;
    const parsedContractId = parseInt(contractId, 10);
    const parsedMesPago = parseInt(mesPago, 10);
    if (isNaN(parsedContractId) || isNaN(parsedMesPago)) return true;
    const whereCondition = {
        contractId: parsedContractId,
        mesPago: parsedMesPago,
    };
    if (pagoIdToExclude) {
        whereCondition.id_pago = { [Op.ne]: pagoIdToExclude };
    }
    const existingPago = await Pago.findOne({ where: whereCondition });
    if (existingPago) {
        throw new Error(`Ya existe un pago registrado para el contrato ID ${contractId} correspondiente al mes ${mesPago}.`);
    }
    return true;
};

const createPagoValidation = [
    body('fechaPago').not().exists().withMessage('La fecha de pago se registra automáticamente.'),
    body('valor').trim().notEmpty().withMessage('El valor del pago es obligatorio.')
        .isDecimal({ decimal_digits: '1,2' }).withMessage('El valor del pago debe ser un número decimal con hasta 2 decimales (ej: 100.50).')
        .toFloat().isFloat({ gt: 0 }).withMessage('El valor del pago debe ser mayor que cero.'),
    body('metodoPago').trim().notEmpty().withMessage('El método de pago es obligatorio.')
        .isIn(METODOS_PAGO_VALIDOS).withMessage(`Método de pago inválido. Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}.`),
    body('mesPago').notEmpty().withMessage('El mes de pago es obligatorio.')
        .isInt({ min: 1, max: 12 }).withMessage('El mes de pago debe ser un número entre 1 (Enero) y 12 (Diciembre).')
        .custom(validateUniquePagoForContractMonth),
    body('contractId').notEmpty().withMessage('El ID del contrato es obligatorio.')
        .isInt({ gt: 0 }).withMessage('El ID del contrato debe ser un número entero positivo.')
        .custom(validateContractExistsAndIsActive)
];
const updatePagoValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del pago en la URL no es válido.')
        .custom(validatePagoExistence),
    body('fechaPago').optional()
        .isISO8601().withMessage('Si actualiza la fecha de pago, debe tener un formato válido (AAAA-MM-DDTHH:mm:ss.sssZ).').toDate(),
    body('valor').optional().trim().notEmpty().withMessage('Si actualiza el valor del pago, no puede estar vacío.')
        .isDecimal({ decimal_digits: '1,2' }).withMessage('El valor del pago debe ser un número decimal con hasta 2 decimales.')
        .toFloat().isFloat({ gt: 0 }).withMessage('El valor del pago debe ser mayor que cero.'),
    body('metodoPago').optional().trim().notEmpty().withMessage('Si actualiza el método de pago, no puede estar vacío.')
        .isIn(METODOS_PAGO_VALIDOS).withMessage(`Método de pago inválido. Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}.`),
    body('mesPago').optional().notEmpty().withMessage('Si actualiza el mes de pago, no puede estar vacío.')
        .isInt({ min: 1, max: 12 }).withMessage('El mes de pago debe ser un número entre 1 y 12.')
        .custom(validateUniquePagoForContractMonth),
    body('contractId').not().exists().withMessage('No se puede cambiar el contrato asociado a un pago existente.')
];
const pagoIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del pago no es válido.')
        .custom(validatePagoExistence)
];

module.exports = { createPagoValidation, updatePagoValidation, pagoIdValidation };