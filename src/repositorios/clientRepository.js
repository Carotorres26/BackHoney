// src/repositorios/clientRepository.js
const Client = require('../modelos/client'); // Asegúrate que la ruta sea correcta
const { Op } = require('sequelize');

const createClient = async (clientData) => {
    return Client.create(clientData);
};

// CAMBIO: Modificado para filtrar por estado. Por defecto, solo trae los activos.
const getAllClients = async (query = {}) => {
    const whereClause = {};

    // Si se especifica un estado ('activo' o 'inactivo'), se usa.
    // Si no, por defecto solo se muestran los 'activos'.
    if (query.estado && ['activo', 'inactivo'].includes(query.estado)) {
        whereClause.estado = query.estado;
    } else {
        whereClause.estado = 'activo';
    }
    
    // Si se pide 'todos', se elimina el filtro de estado.
    if (query.estado === 'todos') {
        delete whereClause.estado;
    }

    return Client.findAll({ where: whereClause });
};

const getClientById = async (id) => {
    // Buscamos sin importar el estado.
    return Client.findByPk(id);
};

const updateClient = async (id, clientData) => {
    const [updated] = await Client.update(clientData, {
        where: { id }
    });
    return updated;
};

// CAMBIO: Ahora hacemos "soft delete" en lugar de borrado físico.
const deleteClient = async (id) => {
    const [updated] = await Client.update({ estado: 'inactivo' }, {
        where: { id }
    });
    return updated; // Devuelve 1 si se actualizó, 0 si no se encontró.
};

const findOne = async (documento) => {
  return Client.findOne({ where: { documento } });
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    findOne
};