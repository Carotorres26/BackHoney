// src/rutas/specimenRoutes.js
const express = require('express');
const router = express.Router();
const specimenController = require('../controladores/specimenController'); // Verifica exportaciones aquí
const {
    createSpecimenValidation,
    updateSpecimenValidation,
    specimenIdValidation,     // <--- Importar la validación consolidada
    moveSpecimenValidation
    // getSpecimenByIdValidation y deleteSpecimenValidation ya no se importan por separado
} = require('../middlewares/specimenValidations'); // Verifica exportaciones aquí
const { authenticate } = require('../middlewares/auth');         // Verifica exportación
const authorize = require('../middlewares/authorize');             // Verifica exportación

// Middleware de log (opcional, pero útil para depurar)
router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en specimenRoutes: ${req.method} ${req.originalUrl}`);
    next();
});

// POST /specimens - Crear un nuevo espécimen
router.post('/',
    authenticate,
    authorize('crearEjemplares'), // Ajusta el nombre del permiso si es necesario
    createSpecimenValidation,
    specimenController.createSpecimen
);

// GET /specimens - Obtener todos los especímenes (con posibles filtros por query params)
router.get('/',
    authenticate,
    authorize('acceso_ejemplares'), // Ajusta el nombre del permiso
    specimenController.getAllSpecimens
);

// GET /specimens/:id - Obtener un espécimen por ID
router.get('/:id',
    authenticate,
    authorize('acceso_ejemplares'), // O un permiso más específico
    specimenIdValidation,      // <--- Usar la validación consolidada y correcta
    specimenController.getSpecimenById
);

// PUT /specimens/:id - Actualizar un espécimen existente
router.put('/:id',
    authenticate,
    authorize('actualizarEjemplares'), // Ajusta el nombre del permiso
    updateSpecimenValidation, // updateSpecimenValidation ya valida el param('id')
    specimenController.updateSpecimen
);

// DELETE /specimens/:id - Eliminar un espécimen
router.delete('/:id',
    authenticate,
    authorize('eliminarEjemplares'), // Ajusta el nombre del permiso
    specimenIdValidation,       // <--- Usar la validación consolidada y correcta
    specimenController.deleteSpecimen
);

// PATCH /specimens/:id/move - Mover un espécimen (cambiar categoría y/o sede)
router.patch('/:id/move',
    authenticate,
    authorize('moverEjemplares'), // Ajusta el nombre del permiso
    moveSpecimenValidation, // moveSpecimenValidation valida param('id') y body
    specimenController.moveSpecimen
);

module.exports = router;