// src/rutas/clientRoutes.js
const express = require('express');
const router = express.Router();
const ClientController = require('../controladores/clientController');
const {
    createClientValidation,  // Renombrado de ValidateClient
    updateClientValidation,  // Nueva para PUT
    clientIdValidation     // Para GET /:id y DELETE /:id
} = require('../middlewares/clientValidations'); // Asegúrate que estos nombres se exporten
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.post('/',
    authenticate,
    authorize('crearClientes'),
    createClientValidation, // Usa la validación de creación
    ClientController.createClient
);

router.get('/',
    authenticate,
    authorize('acceso_clientes'),
    ClientController.getAllClients
);

router.get('/:id',
    authenticate,
    authorize('acceso_clientes'),
    clientIdValidation, // Usa la validación de ID
    ClientController.getClientById
);

router.put('/:id',
    authenticate,
    authorize('actualizarClientes'),
    updateClientValidation, // Usa la validación de actualización
    ClientController.updateClient
);

router.delete('/:id',
    authenticate,
    authorize('eliminarClientes'),
    clientIdValidation, // Usa la validación de ID
    ClientController.deleteClient
);

module.exports = router;