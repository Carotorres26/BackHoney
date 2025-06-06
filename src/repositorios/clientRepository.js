const Client = require('../modelos/client');

const createClient = async (clientData) => {
    return Client.create(clientData);
};

const getAllClients = async () => {
    return Client.findAll();
};

const getClientById = async (id) => {
    return Client.findByPk(id);
};

const updateClient = async (id, clientData) => {
    const [updated] = await Client.update(clientData, {
        where: { id }
    });
    return updated; 
};

const deleteClient = async (id) => {
    const deleted = await Client.destroy({
        where: { id }
    });
    return deleted; 
};

const findOne = async (documento) => {
  return Client.findOne({ where: { documento } })
}

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    findOne
};