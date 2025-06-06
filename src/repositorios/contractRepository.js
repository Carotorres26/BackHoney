// src/repositorios/contractRepository.js
const { Contract, Client, Specimen, Service, Pago, ContractService, sequelize } = require('../modelos/associations');
const { Op } = require('sequelize');

const getContractById = async (id) => {
    const contractId = parseInt(id, 10);
    if (isNaN(contractId) || contractId <= 0) {
        throw new Error('ID de contrato inválido.');
    }
    try {
        const contract = await Contract.findByPk(contractId, {
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nombre', 'documento', 'email', 'celular']
                },
                {
                    model: Specimen,
                    as: 'contractSpecimens',
                    required: false,
                    attributes: ['id', 'name', 'breed', 'color', 'birthDate'],
                    include: [{
                        model: Client,
                        as: 'propietario',
                        attributes: ['id', 'nombre'],
                        required: false
                    }]
                },
                {
                    model: Service,
                    as: 'servicios',
                    attributes: ['id', 'nombre'], 
                    through: { attributes: [] },
                    required: false
                },
                {
                    model: Pago,
                    as: 'pagos',
                    attributes: ['id_pago', 'fechaPago', 'valor', 'mesPago'], 
                    required: false,
                    limit: 10,
                    order: [['fechaPago', 'DESC']]
                }
            ],
            attributes: ['id', 'fechaInicio', 'precioMensual', 'clientId', 'estado', 'createdAt', 'updatedAt']
        });
        if (!contract) return null;
        return contract;
    } catch (error) {
        console.error(`[ContractRepo] Error en getContractById para ID ${id}:`, error.message, error.stack);
        throw new Error(`Error al obtener contrato por ID desde el repositorio: ${error.message}`);
    }
};

const getAllContracts = async () => {
    try {
        return await Contract.findAll({
            include: [
                { model: Client, as: 'client', attributes: ['id', 'nombre', 'documento', 'email', 'celular'] },
                { model: Specimen, as: 'contractSpecimens', attributes: ['id', 'name'], limit: 1, required: false },
                {
                    model: Service,
                    as: 'servicios',
                    attributes: ['id', 'nombre'], // Ajusta 'nombre' si tu campo se llama diferente
                    through: { attributes: [] },
                    required: false
                },
            ],
            attributes: ['id', 'fechaInicio', 'precioMensual', 'clientId', 'estado'],
            order: [['fechaInicio', 'DESC'], ['id', 'DESC']]
        });
    } catch (error) {
        console.error('[ContractRepo] Error en getAllContracts:', error.message, error.stack);
        throw new Error(`Error al obtener todos los contratos desde el repositorio: ${error.message}`);
    }
};

// Funciones para ser llamadas por el servicio que maneja la transacción
const createContractInTransaction = async (contractData, transaction) => {
    if (!contractData.clientId) throw new Error("clientId es requerido en contractData.");
    const newContract = await Contract.create(contractData, { transaction });
    return newContract;
};

const updateContractInTransaction = async (id, contractData, transaction) => {
    const contract = await Contract.findByPk(id, { transaction });
    if (!contract) return null;
    await contract.update(contractData, { transaction });
    return contract;
};

const deleteContractById = async (id, transaction) => {
    const contract = await Contract.findByPk(id, { transaction });
    if (!contract) return 0;
    return await Contract.destroy({ where: { id }, transaction });
};

module.exports = {
    getContractById,
    getAllContracts,
    createContractInTransaction,
    updateContractInTransaction,
    deleteContractById,
};