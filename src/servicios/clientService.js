// src/servicios/clientService.js
const clientRepository = require('../repositorios/clientRepository');

const createClient = async (clientData) => {
    return clientRepository.createClient(clientData);
};

const getAllClients = async (query) => {
    return clientRepository.getAllClients(query);
};

const getClientById = async (id) => {
    return clientRepository.getClientById(id);
};

const updateClient = async (id, clientData) => {
    if (clientData.documento) {
        const existingClient = await clientRepository.findOne(clientData.documento);
        if (existingClient && existingClient.id !== parseInt(id)) {
            throw new Error('Ya existe un cliente con este documento');
        }
    }
    delete clientData.estado;
    const updated = await clientRepository.updateClient(id, clientData);
    if (!updated) {
        throw new Error('Cliente no encontrado o sin cambios para aplicar');
    }
    return clientRepository.getClientById(id);
};

const updateClientStatus = async (id, newStatus) => {
    const client = await clientRepository.getClientById(id);
    if (!client) {
        throw new Error('Cliente no encontrado');
    }
    const updated = await clientRepository.updateClient(id, { estado: newStatus });
    if (!updated) {
        throw new Error('No se pudo actualizar el estado del cliente');
    }
    return clientRepository.getClientById(id);
};

const findOne = async(documento) => {
  return clientRepository.findOne(documento);
};

/**
 * Servicio para la eliminación permanente (hard delete).
 * Incluye la lógica de negocio para prevenir el borrado si hay datos asociados.
 * @param {number} id - El ID del cliente a eliminar.
 * @returns {Promise<boolean>}
 */
const deleteClient = async (id) => {
    const client = await clientRepository.getClientById(id);
    if (!client) {
        throw new Error('Cliente no encontrado');
    }
    if (client.ejemplares > 0) {
        throw new Error('No se puede eliminar un cliente que tiene ejemplares asociados.');
    }
    const deleted = await clientRepository.deleteClient(id);
    if (!deleted) {
        throw new Error('No se pudo eliminar el cliente.');
    }
    return true;
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    findOne,
    updateClientStatus,
    deleteClient // Hard delete
};