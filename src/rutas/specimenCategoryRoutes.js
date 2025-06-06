// src/rutas/specimenCategoryRoutes.js
const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const specimenCategoryController = require('../controladores/specimenCategoryController');
const {
    createSpecimenCategoryValidation,
    updateSpecimenCategoryValidation, // Valida solo 'name' para PUT
    deleteSpecimenCategoryValidation,
    getSpecimenCategoryByIdValidation,
    updateSpecimenCategoryStatusValidation // Valida 'id' y 'estado' para PATCH
} = require('../middlewares/specimenCategoryValidations');
const { authenticate, authorize } = require('../middlewares/auth');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// POST /api/specimen-categories/
router.post('/',
    authenticate, authorize('crearCategorias'),
    createSpecimenCategoryValidation, handleValidationErrors,
    specimenCategoryController.createSpecimenCategory
);

// GET /api/specimen-categories/
router.get('/',
    authenticate, authorize('acceso_categorias'),
    specimenCategoryController.getAllSpecimenCategories
);

// GET /api/specimen-categories/:id
router.get('/:id',
    authenticate, authorize('acceso_categorias'),
    getSpecimenCategoryByIdValidation, handleValidationErrors,
    specimenCategoryController.getSpecimenCategoryById
);

// PUT /api/specimen-categories/:id (SOLO para actualizar 'name')
router.put('/:id',
    authenticate, authorize('actualizarCategorias'),
    updateSpecimenCategoryValidation, // Esta validación ahora solo permite 'name' y bloquea 'estado'
    handleValidationErrors,
    specimenCategoryController.updateSpecimenCategory // Este controlador ahora solo espera 'name'
);

// PATCH /api/specimen-categories/:id/status - Para cambiar el estado
router.patch('/:id/status',
    authenticate, authorize('actualizarCategorias'), // O un permiso como 'cambiarEstadoCategorias'
    updateSpecimenCategoryStatusValidation,
    handleValidationErrors,
    specimenCategoryController.updateSpecimenCategoryStatus // Controlador para el cambio de estado
);

router.delete('/:id',
    authenticate, authorize('eliminarCategorias'),
    deleteSpecimenCategoryValidation, handleValidationErrors,
    specimenCategoryController.deleteSpecimenCategory
);

module.exports = router;