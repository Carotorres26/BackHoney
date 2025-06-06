// src/rutas/sedeRoutes.js
const { Router } = require('express');
const router = Router();
const sedeController = require('../controladores/sedeController.js'); // Verifica que esta ruta y las exportaciones del controlador sean correctas
const { authenticate } = require('../middlewares/auth');             // Verifica exportación
const authorize = require('../middlewares/authorize');           // Verifica exportación

// Importar las validaciones desestructuradas desde el archivo correcto
const {
    createSedeValidation,
    updateSedeValidation, // Esta validación ya incluye la validación del param('id')
    sedeIdValidation      // Para rutas GET /:id y DELETE /:id
} = require('../middlewares/sedevalidation'); 

// Middleware de log (opcional)
router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en sedeRoutes: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /sedes - Obtener todas las sedes
router.get('/',
    authenticate,
    authorize('acceso_sedes'), // Ajusta el nombre del permiso si es necesario
    sedeController.getSedes
);

// GET /sedes/:id - Obtener una sede por ID
router.get('/:id',
    authenticate,
    authorize('acceso_sedes'), // O un permiso más específico
    sedeIdValidation,          // Validación para el ID del parámetro
    sedeController.getSedeById
);

// POST /sedes - Crear una nueva sede
router.post('/',
    authenticate,
    authorize('crearSedes'),   // Ajusta el nombre del permiso
    createSedeValidation,      // Validaciones para los datos de la nueva sede
    sedeController.addSede
);

// PUT /sedes/:id - Actualizar una sede existente
router.put('/:id',
    authenticate,
    authorize('actualizarSedes'), // Ajusta el nombre del permiso
    updateSedeValidation,         // Validaciones para el ID y los datos a actualizar
    sedeController.updateSede
);

// DELETE /sedes/:id - Eliminar una sede
router.delete('/:id',
    authenticate,
    authorize('eliminarSedes'), // Ajusta el nombre del permiso
    sedeIdValidation,           // Validación para el ID del parámetro
    sedeController.deleteSede
);

module.exports = router;