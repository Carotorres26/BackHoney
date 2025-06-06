// src/servicios/contractService.js
const contractRepository = require('../repositorios/contractRepository');
const { Specimen, Client, Service, Contract, sequelize } = require('../modelos/associations');

// Definiciones de Clases de Error
class NotFoundError extends Error {
    constructor(message) { super(message); this.name = "NotFoundError"; this.statusCode = 404; }
}
class BadRequestError extends Error {
    constructor(message) { super(message); this.name = "BadRequestError"; this.statusCode = 400; }
}

const getAllContracts = async () => {
    console.log('[ContractSvc] Obteniendo todos los contratos...');
    return await contractRepository.getAllContracts();
};

const getContractById = async (id) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractSvc] Obteniendo contrato ID: ${contractId}`);
    if (isNaN(contractId) || contractId <= 0) {
        throw new BadRequestError('ID de contrato inválido.');
    }
    const contract = await contractRepository.getContractById(contractId);
    if (!contract) {
        throw new NotFoundError('Contrato no encontrado.');
    }
    return contract;
};

const createContract = async (contractData) => {
    console.log('[ContractSvc] Creando contrato. Datos recibidos:', contractData);
    const { clientId, specimenId, serviceIds = [], ...newContractDetails } = contractData;
    let newContractId; // Para almacenar el ID del contrato creado

    const transaction = await sequelize.transaction();
    try {
        if (!clientId) {
            // No es necesario rollback aquí porque la transacción aún no ha hecho nada.
            throw new BadRequestError("El ID del cliente (clientId) es obligatorio.");
        }
        const clientExists = await Client.findByPk(parseInt(clientId, 10), { transaction, attributes: ['id'] });
        if (!clientExists) {
            throw new NotFoundError(`Cliente con ID ${clientId} no encontrado.`);
        }

        let specimenToAssociateInstance = null;
        if (specimenId) {
            const numericSpecimenId = parseInt(specimenId, 10);
            if (isNaN(numericSpecimenId) || numericSpecimenId <= 0) {
                throw new BadRequestError(`El ID del ejemplar proporcionado ('${specimenId}') no es válido.`);
            }
            specimenToAssociateInstance = await Specimen.findByPk(numericSpecimenId, { transaction, attributes: ['id', 'name', 'contractId'] });
            if (!specimenToAssociateInstance) {
                throw new NotFoundError(`Ejemplar con ID ${numericSpecimenId} no encontrado para asociar.`);
            }
            if (specimenToAssociateInstance.contractId !== null) {
                throw new BadRequestError(`El ejemplar '${specimenToAssociateInstance.name}' (ID: ${numericSpecimenId}) ya tiene un contrato activo (Contrato ID: ${specimenToAssociateInstance.contractId}).`);
            }
        }

        const newContract = await Contract.create({
            ...newContractDetails,
            clientId: parseInt(clientId, 10)
        }, { transaction });
        newContractId = newContract.id;
        console.log(`[ContractSvc] Contrato base ID ${newContractId} creado en transacción.`);

        if (Array.isArray(serviceIds) && serviceIds.length > 0) {
            const numericServiceIds = serviceIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id) && id > 0);
            if (numericServiceIds.length > 0) {
                const services = await Service.findAll({ where: { id: numericServiceIds }, transaction, attributes: ['id'] });
                if (services.length !== numericServiceIds.length) {
                    const missingIds = numericServiceIds.filter(id => !services.map(s => s.id).includes(id));
                    throw new NotFoundError(`Servicios no encontrados: ${missingIds.join(', ')}.`);
                }
                await newContract.setServicios(numericServiceIds, { transaction });
                console.log(`[ContractSvc] Servicios asociados al contrato ${newContractId} en transacción.`);
            }
        }

        if (specimenToAssociateInstance) {
            await specimenToAssociateInstance.update({ contractId: newContractId }, { transaction });
            console.log(`[ContractSvc] Ejemplar ID ${specimenToAssociateInstance.id} asociado al contrato ID ${newContractId} en transacción.`);
        }

        await transaction.commit();
        console.log(`[ContractSvc] Transacción committed para contrato ${newContractId}.`);

    } catch (error) {
        // Solo hacer rollback si la transacción está activa y no ha sido finalizada.
        if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
            console.log('[ContractSvc] Error durante la transacción de creación, haciendo rollback...');
            await transaction.rollback();
        }
        console.error('[ContractSvc] Error durante la creación del contrato (transacción):', error.message);
        if (error.statusCode) throw error;
        throw new Error(`Error al crear el contrato: ${error.message}`);
    }

    // --- OBTENER DATOS PARA LA RESPUESTA (FUERA DE LA TRANSACCIÓN DE ESCRITURA) ---
    // Si esta parte falla, la transacción de creación ya se completó exitosamente.
    try {
        if (!newContractId) {
            // Esto solo ocurriría si hubo un error antes del commit y no se lanzó correctamente
            console.error("[ContractSvc] newContractId no está definido después de la sección de transacción, aunque no hubo error aparente.");
            throw new Error("No se pudo determinar el ID del contrato creado.");
        }
        console.log(`[ContractSvc] Obteniendo contrato ${newContractId} con includes para la respuesta...`);
        const contractWithIncludes = await contractRepository.getContractById(newContractId);
        if (!contractWithIncludes) {
            // Esto es raro si la creación fue exitosa, pero es una verificación.
            throw new Error(`Contrato ${newContractId} creado pero no pudo ser recuperado con sus asociaciones.`);
        }
        return contractWithIncludes;
    } catch (readError) {
        console.error(`[ContractSvc] Error obteniendo el contrato ID ${newContractId} recién creado con sus asociaciones:`, readError.message);
        // El contrato FUE creado. El problema es al recuperarlo para la respuesta.
        // Podrías devolver un objeto simple con el ID o un mensaje específico.
        // O, si es crítico que la respuesta completa sea devuelta, lanzar un error que lo indique.
        throw new Error(`El contrato fue creado (ID: ${newContractId}), pero hubo un error al cargar sus detalles completos: ${readError.message}. Por favor, verifique la lista de contratos.`);
    }
};

const updateContract = async (id, contractData, serviceIdsFromController) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractSvc] Actualizando contrato ID: ${contractId}.`);
    if (isNaN(contractId) || contractId <= 0) throw new BadRequestError("ID de contrato inválido.");
    let updatedContractId = null;

    const transaction = await sequelize.transaction();
    try {
        const contract = await Contract.findByPk(contractId, { transaction });
        if (!contract) {
            throw new NotFoundError('Contrato no encontrado para actualizar.');
        }
        updatedContractId = contract.id; // Guardar para después

        const { clientId, specimenId, serviceIds, ...updatableContractData } = contractData;

        await contract.update(updatableContractData, { transaction });

        if (serviceIdsFromController !== undefined) {
            const numericServiceIds = (Array.isArray(serviceIdsFromController) ? serviceIdsFromController : [])
                .map(sid => parseInt(sid, 10)).filter(sid => !isNaN(sid) && sid > 0);
            if (numericServiceIds.length > 0) {
                const services = await Service.findAll({ where: { id: numericServiceIds }, transaction, attributes: ['id'] });
                if (services.length !== numericServiceIds.length) {
                    const missingIds = numericServiceIds.filter(sid => !services.map(s => s.id).includes(sid));
                    throw new NotFoundError(`IDs de servicio inválidos al actualizar: ${missingIds.join(', ')}.`);
                }
            }
            await contract.setServicios(numericServiceIds, { transaction });
        }
        await transaction.commit();
        console.log(`[ContractSvc] Transacción de actualización committed para contrato ${updatedContractId}.`);
    } catch (error) {
        if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
            await transaction.rollback();
        }
        console.error(`[ContractSvc] Error durante la transacción de actualización de contrato ID ${id}:`, error.message);
        if (error.statusCode) throw error;
        throw new Error(`Error al actualizar el contrato: ${error.message}`);
    }

    try {
        if (!updatedContractId) {
             throw new Error("No se pudo determinar el ID del contrato actualizado.");
        }
        return await contractRepository.getContractById(updatedContractId);
    } catch (readError) {
        console.error(`[ContractSvc] Error obteniendo el contrato ID ${updatedContractId} recién actualizado:`, readError.message);
        throw new Error(`El contrato fue actualizado (ID: ${updatedContractId}), pero hubo un error al cargar sus detalles: ${readError.message}.`);
    }
};

const deleteContract = async (id) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractSvc] Eliminando contrato ID: ${contractId}`);
    if (isNaN(contractId) || contractId <= 0) throw new BadRequestError("ID de contrato inválido para eliminar.");

    const transaction = await sequelize.transaction();
    try {
        const contract = await Contract.findByPk(contractId, { transaction });
        if (!contract) {
            throw new NotFoundError('Contrato no encontrado para eliminar.');
        }
        await contract.setServicios([], { transaction });
        await Specimen.update({ contractId: null }, { where: { contractId: contractId }, transaction });
        await contract.destroy({ transaction });
        await transaction.commit();
        console.log(`[ContractSvc] Contrato ID ${contractId} eliminado exitosamente.`);
    } catch (error) {
        if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
            await transaction.rollback();
        }
        console.error(`[ContractSvc] Error al eliminar contrato ID ${contractId}:`, error.message);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new BadRequestError('No se puede eliminar el contrato: tiene registros asociados que lo impiden.');
        }
        if (error.statusCode) throw error;
        throw new Error(`Error al eliminar el contrato: ${error.message}`);
    }
};

module.exports = {
    getAllContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract
};