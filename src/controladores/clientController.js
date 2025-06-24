// src/controladores/clientController.js
const clientService = require('../servicios/clientService');
const { validationResult } = require('express-validator');

const createClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await clientService.getAllClients(req.query);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la lista de clientes", error: error.message });
    }
};

const getClientById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
    }
    try {
        const client = await clientService.getClientById(req.params.id);
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el cliente", error: error.message });
    }
};

const updateClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const client = await clientService.updateClient(req.params.id, req.body);
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateClientStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const updatedClient = await clientService.updateClientStatus(id, estado);
        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

/**
 * Controlador para la eliminación permanente (hard delete).
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
const deleteClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
    }
    try {
        await clientService.deleteClient(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    updateClientStatus,
    deleteClient // Hard delete
};