const clientRepository = require('../repositorios/clientRepository');

const createClient = async (clientData) => {
    return clientRepository.createClient(clientData);
};

const getAllClients = async () => {
    return clientRepository.getAllClients();
};

const getClientById = async (id) => {
    return clientRepository.getClientById(id);
};

const updateClient = async (id, clientData) => {
    // Verificar si hay otro cliente con el mismo documento (excepto el actual)
    if (clientData.documento) {
        const existingClient = await clientRepository.findOne(clientData.documento);
        if (existingClient && existingClient.id !== parseInt(id)) {
            throw new Error('Ya existe un cliente con este documento');
        }
    }
    
    const updated = await clientRepository.updateClient(id, clientData);
    if (!updated) {
        throw new Error('Client not found');
    }
    return clientRepository.getClientById(id); 
};

const deleteClient = async (id) => {
    const deleted = await clientRepository.deleteClient(id);
    if (!deleted) {
        throw new Error('Client not found');
    }
    return true;
};

const findOne = async(documento) => {
  return clientRepository.findOne(documento);
}

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    findOne
};