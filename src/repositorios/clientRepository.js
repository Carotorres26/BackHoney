// src/repositorios/clientRepository.js
const Client = require('../modelos/client');
const { Op } = require('sequelize');

/**
 * Crea un nuevo cliente en la base de datos.
 * @param {object} clientData - Los datos del cliente a crear.
 * @returns {Promise<Client>} El cliente creado.
 */
const createClient = async (clientData) => {
    return Client.create(clientData);
};

/**
 * Obtiene todos los clientes con opción de filtrar por estado.
 * @param {object} query - Objeto de consulta, ej: { estado: 'activo' }.
 * @returns {Promise<Array<Client>>} Un array de clientes.
 */
const getAllClients = async (query = {}) => {
    const whereClause = {};
    if (query.estado && ['activo', 'inactivo'].includes(query.estado)) {
        whereClause.estado = query.estado;
    } else if (query.estado !== 'todos') { // Si no es 'todos' ni un estado válido, por defecto son activos
        whereClause.estado = 'activo';
    }
    return Client.findAll({ where: whereClause });
};

/**
 * Obtiene un cliente por su ID.
 * @param {number} id - El ID del cliente.
 * @returns {Promise<Client|null>} El cliente encontrado o null.
 */
const getClientById = async (id) => {
    return Client.findByPk(id);
};

/**
 * Actualiza los datos de un cliente por su ID.
 * @param {number} id - El ID del cliente.
 * @param {object} clientData - Los nuevos datos del cliente.
 * @returns {Promise<number>} El número de filas actualizadas (1 o 0).
 */
const updateClient = async (id, clientData) => {
    const [updated] = await Client.update(clientData, { where: { id } });
    return updated;
};

/**
 * Busca un cliente por su número de documento.
 * @param {string} documento - El documento del cliente.
 * @returns {Promise<Client|null>} El cliente encontrado o null.
 */
const findOne = async (documento) => {
  return Client.findOne({ where: { documento } });
};

/**
 * Realiza un borrado físico y permanente (hard delete) de un cliente.
 * @param {number} id - El ID del cliente a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas.
 */
const deleteClient = async (id) => {
    const deleted = await Client.destroy({
        where: { id }
    });
    return deleted;
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    findOne,
    deleteClient // Hard delete
};