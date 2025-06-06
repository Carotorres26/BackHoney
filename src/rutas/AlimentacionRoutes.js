// src/rutas/AlimentacionRoutes.js
const express = require('express');
const router = express.Router();
const alimentacionController = require('../controladores/AlimentacionController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    createAlimentacionValidation,
    updateAlimentacionValidation,
    alimentacionIdValidation,     // Usar esta para GET /:id y DELETE /:id
    validateEstadoUpdate,
    validateSpecimenIdParam     // Para la ruta /by-specimen/:specimenId
} = require('../middlewares/AlimentacionValidation');

// POST /api/alimentaciones - Crear
router.post('/',
    authenticate,
    authorize('crearAlimentacion'),
    createAlimentacionValidation,
    alimentacionController.createAlimentacion
);

// GET /api/alimentaciones - Obtener todos
router.get('/',
    authenticate,
    authorize('accesoAlimentacion'),
    alimentacionController.getAllAlimentaciones
);

// GET /api/alimentaciones/:id - Obtener uno
router.get('/:id',
    authenticate,
    authorize('accesoAlimentacion'),
    alimentacionIdValidation, // Usa la validación consolidada
    alimentacionController.getAlimentacionById
);

// PUT /api/alimentaciones/:id - Actualizar completo
router.put('/:id',
    authenticate,
    authorize('actualizarAlimentacion'),
    updateAlimentacionValidation, // updateAlimentacionValidation ya valida el param('id')
    alimentacionController.updateAlimentacion
);

// DELETE /api/alimentaciones/:id - Eliminar
router.delete('/:id',
    authenticate,
    authorize('eliminarAlimentacion'),
    alimentacionIdValidation, // Usa la validación consolidada
    alimentacionController.deleteAlimentacion
);

// PATCH /api/alimentaciones/:id/estado - Actualizar estado
router.patch('/:id/estado',
    authenticate,
    authorize('actualizarAlimentacion'), // O un permiso específico como 'cambiarEstadoAlimentacion'
    validateEstadoUpdate,
    alimentacionController.updateEstado
);

// GET /api/alimentaciones/by-specimen/:specimenId - Obtener por espécimen
router.get('/by-specimen/:specimenId',
    authenticate,
    authorize('accesoAlimentacion'),
    validateSpecimenIdParam,
    alimentacionController.getAlimentacionesBySpecimen
);

module.exports = router;