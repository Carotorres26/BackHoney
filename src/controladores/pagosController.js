// src/controladores/pagosController.js
const pagosService = require('../servicios/pagosService');
const { validationResult } = require('express-validator');
const pagos = require('../modelos/pagos'); 

const getPagos = async (req, res) => {
    try {
        const pagos = await pagosService.listPagos();
        res.status(200).json(pagos);
    } catch (error) {
        console.error("[PagosController] Error en getPagos:", error);
        res.status(500).json({ message: 'Error interno al obtener los pagos', error: error.message });
    }
};

const getPagoById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const pago = await pagosService.getPagoById(req.params.id);
        // El servicio ahora lanza error si no se encuentra
        res.status(200).json(pago);
    } catch (error) {
        console.error(`[PagosController] Error en getPagoById ${req.params.id}:`, error);
        if (error.message.includes('Pago no encontrado') || error.message.includes('inválido')) { // Incluye ID inválido
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: 'Error interno al obtener el pago', error: error.message });
        }
    }
};

const getPagosByContractId = async (req, res) => {
    // Considera añadir validación para req.params.contractId en pagosvalidation.js
    try {
        const pagos = await pagosService.getPagosByContractId(req.params.contractId);
        res.status(200).json(pagos); // Devuelve array vacío si no hay pagos
    } catch (error) {
         console.error(`[PagosController] Error en getPagosByContractId ${req.params.contractId}:`, error);
         if (error.message.includes('inválido')) { // Si el ID del contrato es inválido
             res.status(400).json({ message: error.message });
         } else {
            res.status(500).json({ message: 'Error interno al obtener pagos del contrato', error: error.message });
         }
    }
};

const addPago = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const pago = await pagosService.createPago(req.body);
        res.status(201).json(pago);
    } catch (error) {
        console.error("[PagosController] Error en addPago:", error);
        // Devuelve 400 si es error de validación (ej: duplicado) o 500 si es otro error
        res.status(400).json({ message: 'Error al agregar el pago', error: error.message });
    }
};

const updatePago = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const pago = await pagosService.updatePago(req.params.id, req.body);
        res.status(200).json(pago);
    } catch (error) {
        console.error(`[PagosController] Error en updatePago ${req.params.id}:`, error);
        if (error.message.includes('Pago no encontrado')) {
            res.status(404).json({ message: error.message });
        } else { // Otros errores (ej: validación de datos, BD) podrían ser 400 o 500
            res.status(400).json({ message: 'Error al actualizar el pago', error: error.message });
        }
    }
};

// deletePago function removed

module.exports = {
    getPagos,
    getPagoById,
    getPagosByContractId,
    addPago,
    updatePago
};