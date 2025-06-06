// src/rutas/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const serviceController = require('../controladores/serviceController');
const {
    updateServiceValidation,
    serviceIdValidation
} = require('../middlewares/serviceValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize'); // Asumiendo que es importado correctamente
const uploadMiddleware = require('../middlewares/upload'); // Este es el upload.single('imagen')

// Validación para el ID en la ruta PATCH /status
const validateServiceIdForStatus = param('id').isInt({ gt: 0 }).withMessage('El ID del servicio debe ser un número entero positivo.');

router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en serviceRoutes: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /services
router.get( '/',
    authenticate,
    authorize('acceso_servicios'),
    serviceController.getAllServices
);

// GET /services/:id
router.get( '/:id',
    authenticate,
    authorize('ver_servicio_detalle'),
    serviceIdValidation,
    serviceController.getServiceById
);

// POST /services
router.post( '/',
    authenticate,
    authorize('crearServicios'),
    uploadMiddleware, // Multer primero para procesar el archivo y los campos de texto
    serviceController.createService // El controlador valida el req.body después de Multer
);

// PUT /services/:id
router.put( '/:id',
    authenticate,
    authorize('actualizarServicios'),
    uploadMiddleware,          // Multer primero
    updateServiceValidation,   // Validaciones (param y body post-Multer)
    serviceController.updateService
);

// DELETE /services/:id
router.delete( '/:id',
    authenticate,
    authorize('eliminarServicios'),
    serviceIdValidation,
    serviceController.deleteService
);

// PATCH /services/:id/status
router.patch(
    '/:id/status',
    authenticate,
    authorize('cambiarEstadoServicios'),
    validateServiceIdForStatus, // Valida el ID del parámetro
    // La validación del body para 'status' se hace en el controlador toggleServiceStatus
    serviceController.toggleServiceStatus
);

module.exports = router;