// src/servicios/clientService.js
const clientRepository = require('../repositorios/clientRepository');

const createClient = async (clientData) => {
    return clientRepository.createClient(clientData);
};

// CAMBIO: Pasamos el query al repositorio para el filtrado por estado.
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
    
    // CAMBIO: Evitamos que el estado se modifique por esta vía.
    // El estado solo debe cambiarse a través del endpoint específico.
    delete clientData.estado;

    const updated = await clientRepository.updateClient(id, clientData);
    if (!updated) {
        throw new Error('Cliente no encontrado');
    }
    return clientRepository.getClientById(id);
};

// CAMBIO: La lógica ahora es de "soft delete" (desactivación).
const deleteClient = async (id) => {
    const client = await clientRepository.getClientById(id);
    if (!client) {
        throw new Error('Cliente no encontrado');
    }
    if (client.estado === 'inactivo') {
        throw new Error('El cliente ya está inactivo');
    }

    const deactivated = await clientRepository.deleteClient(id); // El repo lo marca como inactivo
    if (!deactivated) {
        throw new Error('No se pudo desactivar el cliente');
    }
    return true;
};

// ---- NUEVO SERVICIO: Para cambiar el estado explícitamente ----
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

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    findOne,
    updateClientStatus // ---- NUEVO: Exportamos el nuevo servicio
};