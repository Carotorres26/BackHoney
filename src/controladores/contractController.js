// src/controladores/contractController.js
const contractService = require('../servicios/contractService'); // Verifica ruta
const { validationResult } = require('express-validator');

const getContractById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const contract = await contractService.getContractById(req.params.id);
        // El servicio lanza error si no encuentra
        res.status(200).json(contract);
    } catch (error) {
        console.error('[ContractCtrl] Error getContractById:', error);
        if (error.message.includes('Contrato no encontrado') || error.message.includes('inválido')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }
};

const getAllContracts = async (req, res) => {
    try {
        console.log('[ContractCtrl] Solicitando todos los contratos al servicio...'); // Log inicio
        const contracts = await contractService.getAllContracts();
        console.log(`[ContractCtrl] Servicio devolvió ${contracts?.length ?? 0} contratos.`); // Log éxito
        res.status(200).json(contracts);
    } catch (error) {
        // Log del error específico que viene del servicio
        console.error('[ContractCtrl] Error en contractService.getAllContracts:', error.message, error.stack);
        // Devolver respuesta genérica 500
        res.status(500).json({ message: 'Servicio: Error al obtener contratos', error: error.message }); // Mantenemos el mensaje para el frontend
    }
};

const createContract = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        // *** ASEGÚRATE DE PASAR EL req.body COMPLETO ***
        // El servicio createContract ahora extraerá serviceIds, specimenIdToAssociate, etc.
        const contract = await contractService.createContract(req.body);
        res.status(201).json(contract);
    } catch (error) {
        console.error('[ContractCtrl] Error createContract:', error);
        // Devuelve un error 400 o 500 dependiendo del tipo de error del servicio
        if (error.message.includes("inválido") || error.message.includes("obligatorio") || error.message.includes("no encontrado")) {
             res.status(400).json({ message: 'Error al crear contrato', error: error.message });
        } else {
             res.status(500).json({ message: 'Error interno al crear contrato', error: error.message });
        }
    }
};

const updateContract = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { serviceIds, ...contractData } = req.body; // serviceIds para actualizar asociación M-M
        const contract = await contractService.updateContract(req.params.id, contractData, serviceIds);
        res.status(200).json(contract);
    } catch (error) {
        console.error(`[ContractCtrl] Error updateContract ${req.params.id}:`, error);
        if (error.message.includes('Contrato no encontrado')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Error al actualizar contrato', error: error.message });
        }
    }
};

const deleteContract = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        await contractService.deleteContract(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(`[ContractCtrl] Error deleteContract ${req.params.id}:`, error);
        if (error.message.includes('Contrato no encontrado')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('registros asociados')) {
             res.status(400).json({ message: error.message }); // Error de FK
        } else {
            res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }
};

module.exports = {
    getContractById,
    getAllContracts,
    createContract,
    updateContract,
    deleteContract
};