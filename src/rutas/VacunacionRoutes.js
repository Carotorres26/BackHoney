// src/rutas/VacunacionRoutes.js
const express = require('express');
const router = express.Router();
const vacunacionController = require('../controladores/VacunacionController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    createVacunacionValidation,
    updateVacunacionValidation,
    vacunacionIdValidation,          // Usar esta para GET /:id y DELETE /:id
    validateSpecimenIdParamForList // Renombrado de validateSpecimenIdParam
} = require('../middlewares/VacunacionValidation');

// POST /api/vacunaciones - Crear
router.post('/',
    authenticate,
    authorize('crearVacunacion'),
    createVacunacionValidation,
    vacunacionController.createVacunacion
);

// GET /api/vacunaciones - Obtener todos
router.get('/',
    authenticate,
    authorize('accesoVacunacion'),
    vacunacionController.getAllVacunaciones
);

// GET /api/vacunaciones/:id - Obtener uno
router.get('/:id',
    authenticate,
    authorize('accesoVacunacion'),
    vacunacionIdValidation, // Usa la validación de ID
    vacunacionController.getVacunacionById
);

// PUT /api/vacunaciones/:id - Actualizar
router.put('/:id',
    authenticate,
    authorize('actualizarVacunacion'),
    updateVacunacionValidation, // updateVacunacionValidation ya valida el param('id')
    vacunacionController.updateVacunacion
);

// DELETE /api/vacunaciones/:id - Eliminar
router.delete('/:id',
    authenticate,
    authorize('eliminarVacunacion'),
    vacunacionIdValidation, // Usa la validación de ID
    vacunacionController.deleteVacunacion
);

// GET /api/vacunaciones/by-specimen/:specimenId
router.get('/by-specimen/:specimenId',
    authenticate,
    authorize('accesoVacunacion'),
    validateSpecimenIdParamForList,
    vacunacionController.getVacunacionesBySpecimen
);

module.exports = router;