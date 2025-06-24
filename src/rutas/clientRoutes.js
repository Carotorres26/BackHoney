// src/rutas/clientRoutes.js
const express = require('express');
const router = express.Router();
const ClientController = require('../controladores/clientController');
const {
    createClientValidation,
    updateClientValidation,
    clientIdValidation,
    updateClientStatusValidation
} = require('../middlewares/clientValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.use(authenticate);

// --- RUTAS CRUD PARA CLIENTES (PATRÓN SIMPLIFICADO) ---

router.get('/', authorize('acceso_clientes'), ClientController.getAllClients);
router.get('/:id', authorize('acceso_clientes'), clientIdValidation, ClientController.getClientById);
router.post('/', authorize('crearClientes'), createClientValidation, ClientController.createClient);
router.put('/:id', authorize('actualizarClientes'), updateClientValidation, ClientController.updateClient);

// PATCH para cambiar el estado (activar/desactivar)
router.patch(
    '/:id/status',
    authorize('cambiarEstadoClientes'), 
    updateClientStatusValidation,
    ClientController.updateClientStatus
);

// DELETE para la eliminación PERMANENTE
router.delete(
    '/:id',
    authorize('eliminarClientes'), // Este permiso ahora es para una acción destructiva
    clientIdValidation,
    ClientController.deleteClient
);

module.exports = router;