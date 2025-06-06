// src/rutas/medicineRoutes.js
const express = require('express');
const router = express.Router();
const medicineController = require('../controladores/medicineController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    medicineCreateValidation,
    medicineUpdateValidation,
    medicineIdValidation,         // Usar esta para GET /:id y DELETE /:id
    validateMedicineEstadoUpdate, // Renombrado de validateEstadoUpdate
    validateMedicineSpecimenIdParam // Para la ruta /by-specimen/:specimenId (renombrado de validateSpecimenIdParam)
} = require('../middlewares/medicineValidation');

// POST /api/medicines - Crear
router.post('/',
    authenticate,
    authorize('crearMedicina'),
    medicineCreateValidation,
    medicineController.createMedicine
);

// GET /api/medicines - Obtener todos
router.get('/',
    authenticate,
    authorize('acceso_medicina'),
    medicineController.getAllMedicines
);

// GET /api/medicines/:id - Obtener uno
router.get('/:id',
    authenticate,
    authorize('acceso_medicina'),
    medicineIdValidation, // Usa la validación de ID
    medicineController.getMedicineById
);

// PUT /api/medicines/:id - Actualizar completo
router.put('/:id',
    authenticate,
    authorize('actualizarMedicina'),
    medicineUpdateValidation, // medicineUpdateValidation ya valida el param('id')
    medicineController.updateMedicine
);

// DELETE /api/medicines/:id - Eliminar
router.delete('/:id',
    authenticate,
    authorize('eliminarMedicina'),
    medicineIdValidation, // Usa la validación de ID
    medicineController.deleteMedicine
);

// PATCH /api/medicines/:id/estado - Actualizar estado
router.patch('/:id/estado',
    authenticate,
    authorize('actualizarMedicina'),
    validateMedicineEstadoUpdate,
    medicineController.updateEstado
);

// GET /api/medicines/by-specimen/:specimenId - Obtener por espécimen
router.get('/by-specimen/:specimenId',
    authenticate,
    authorize('acceso_medicina'),
    validateMedicineSpecimenIdParam,
    medicineController.getMedicinesBySpecimen
);

module.exports = router;