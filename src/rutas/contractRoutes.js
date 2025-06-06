// src/rutas/contractRoutes.js
const express = require('express');
const router = express.Router(); // Asegúrate de crear la instancia del router
const contractController = require('../controladores/contractController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    createContractValidation,
    updateContractValidation,
    contractIdValidation // Usar esta para GET /:id y DELETE /:id
    // deleteContractValidation y getContractByIdValidation ya no se importan si usas contractIdValidation
} = require('../middlewares/contractValidations');

router.get('/',
    authenticate,
    authorize('acceso_contratos'),
    contractController.getAllContracts
);

router.get('/:id',
    authenticate,
    authorize('acceso_contratos'),
    contractIdValidation, // Usa la validación de ID
    contractController.getContractById
);

router.post('/',
    authenticate,
    authorize('crearContratos'),
    createContractValidation,
    contractController.createContract
);

router.put('/:id',
    authenticate,
    authorize('actualizarContratos'),
    updateContractValidation, // updateContractValidation ya valida el param('id')
    contractController.updateContract
);

router.delete('/:id',
    authenticate,
    authorize('eliminarContratos'),
    contractIdValidation, // Usa la validación de ID
    contractController.deleteContract
);

module.exports = router;