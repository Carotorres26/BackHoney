// src/rutas/pagoRoutes.js
const { Router } = require('express');
const router = Router(); // Crear instancia del router
const pagosController = require('../controladores/pagosController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    createPagoValidation,
    updatePagoValidation,
    pagoIdValidation // Usar esta para GET /:id
    // getPagoByIdValidation ya no se importa si usas pagoIdValidation
} = require('../middlewares/pagosvalidation'); // Corregido nombre de archivo: pagosValidation.js (o pagosvalidation.js según tu sistema)

router.get('/',
    authenticate,
    authorize('acceso_pagos'),
    pagosController.getPagos
);

router.get('/:id',
    authenticate,
    authorize('acceso_pagos'),
    pagoIdValidation, // Usa la validación de ID
    pagosController.getPagoById
);

// GET /pagos/contract/:contractId
// Considera añadir una validación para contractId aquí si es necesario
// ej. const { contractIdValidation } = require('../middlewares/contractValidations');
// router.get('/contract/:contractId', authenticate, authorize('acceso_pagos'), contractIdValidation, pagosController.getPagosByContractId);
router.get('/contract/:contractId',
    authenticate,
    authorize('acceso_pagos'),
    // Aquí necesitarías una validación específica para el param 'contractId'
    // Podrías crearla en pagosValidation.js o reutilizar/adaptar una de contractValidations.js
    // Por ahora, se deja sin validación explícita del param, asumiendo que el controlador/servicio lo maneja.
    pagosController.getPagosByContractId
);

router.post('/',
    authenticate,
    authorize('crearPagos'),
    createPagoValidation,
    pagosController.addPago
);

router.put('/:id',
    authenticate,
    authorize('actualizarPagos'),
    updatePagoValidation, // updatePagoValidation ya valida el param('id')
    pagosController.updatePago
);

// No tienes ruta DELETE para pagos en tu archivo original

module.exports = router;