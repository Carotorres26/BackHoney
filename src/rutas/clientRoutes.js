// src/rutas/clientRoutes.js
const express = require('express');
const router = express.Router();
const ClientController = require('../controladores/clientController');
const {
    createClientValidation,
    updateClientValidation,
    clientIdValidation,
    updateClientStatusValidation // ---- NUEVO: Importamos la nueva validación
} = require('../middlewares/clientValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// POST / (Crear Cliente) - sin cambios
router.post('/',
    authenticate,
    authorize('crearClientes'),
    createClientValidation,
    ClientController.createClient
);

// GET / (Obtener Clientes) - sin cambios en la ruta, pero ahora acepta query params
router.get('/',
    authenticate,
    authorize('acceso_clientes'),
    ClientController.getAllClients
);

// GET /:id (Obtener Cliente por ID) - sin cambios
router.get('/:id',
    authenticate,
    authorize('acceso_clientes'),
    clientIdValidation,
    ClientController.getClientById
);

// PUT /:id (Actualizar Cliente) - sin cambios
router.put('/:id',
    authenticate,
    authorize('actualizarClientes'),
    updateClientValidation,
    ClientController.updateClient
);

// DELETE /:id (Desactivar Cliente) - sin cambios en la ruta, pero la acción es soft-delete
router.delete('/:id',
    authenticate,
    authorize('eliminarClientes'),
    clientIdValidation,
    ClientController.deleteClient
);

// ---- NUEVA RUTA: Para cambiar el estado de un cliente ----
// Se recomienda usar PATCH para actualizaciones parciales.
router.patch('/:id/status',
    authenticate,
    authorize('gestionarEstadoClientes'), // <-- Considera crear este nuevo permiso
    updateClientStatusValidation, // Usa la nueva validación
    ClientController.updateClientStatus // Usa el nuevo controlador
);

module.exports = router;