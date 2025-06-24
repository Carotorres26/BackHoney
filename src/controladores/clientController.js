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
        // Este error suele ser por violaciones de unicidad que la validación no atrapó (race conditions)
        res.status(400).json({ message: error.message });
    }
};

// CAMBIO: Ahora pasamos req.query al servicio para permitir el filtrado por estado.
const getAllClients = async (req, res) => {
    try {
        // req.query puede ser {}, { estado: 'activo' }, { estado: 'inactivo' }, o { estado: 'todos' }
        const clients = await clientService.getAllClients(req.query);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la lista de clientes", error: error.message });
    }
};

const getClientById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // El error vendrá de clientIdValidation (ID no es número, o no existe)
        return res.status(404).json({ errors: errors.array() });
    }

    try {
        // La validación ya confirmó que existe, así que podemos buscarlo de forma segura.
        const client = await clientService.getClientById(req.params.id);
        res.status(200).json(client);
    } catch (error) {
        // Este bloque es por si acaso, pero la validación debería prevenirlo.
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
        // El servicio lanza error si no encuentra el cliente o si hay un duplicado
        res.status(400).json({ message: error.message });
    }
};

// CAMBIO: La lógica ahora es de desactivación (soft delete).
const deleteClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // El error vendrá de clientIdValidation (ID no es número, o no existe)
        return res.status(404).json({ errors: errors.array() });
    }
    
    try {
        await clientService.deleteClient(req.params.id);
        // 204 No Content es la respuesta estándar para un DELETE exitoso.
        res.status(204).send();
    } catch (error) {
        // El servicio lanzará un error si el cliente ya está inactivo, por ejemplo.
        res.status(400).json({ message: error.message });
    }
};

// ---- NUEVO CONTROLADOR: Para cambiar el estado de un cliente ----
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
        // El servicio lanza un error si el cliente no se encuentra
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    updateClientStatus // Exportamos el nuevo controlador
};