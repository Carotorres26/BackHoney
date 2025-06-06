// src/rutas/roleRoutes.js
const express = require('express');
const router = express.Router();

const roleController = require('../controladores/roleController');
const {
    createRoleValidation,
    updateRoleValidation,
    roleIdParamValidation,      // <--- Nombre consistente con la exportación
    toggleRoleStatusValidation  // <--- Nombre consistente con la exportación
} = require('../middlewares/roleValidations'); // Ajusta la ruta si es necesario

const { authenticate, authorize } = require('../middlewares/auth'); // Ajusta la ruta si es necesario

// Middleware de log para todas las rutas de roles
router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en roleRoutes: ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        console.log(`>>> [${new Date().toISOString()}] Body:`, req.body);
    }
    next();
});

// Aplicar autenticación a todas las rutas definidas después de este middleware
router.use(authenticate); 

// --- RUTAS CRUD PARA ROLES ---

// GET /api/roles - Obtener todos los roles
router.get(
    '/',
    authorize('acceso_roles'), 
    roleController.getAllRoles
);

// GET /api/roles/:id - Obtener un rol por ID
router.get(
    '/:id',
    authorize('acceso_roles'), 
    roleIdParamValidation,        // Middleware de validación para el ID
    roleController.getRoleById
);

// POST /api/roles - Crear un nuevo rol
router.post(
    '/',
    authorize('crearRoles'),   
    createRoleValidation,        // Middlewares de validación para la creación
    roleController.createRole
);

// PUT /api/roles/:id - Actualizar un rol existente
router.put(
    '/:id',
    authorize('actualizarRoles'), 
    updateRoleValidation,       // Middlewares de validación para la actualización (incluye param id)
    roleController.updateRole
);

// DELETE /api/roles/:id - Eliminar un rol
router.delete(
    '/:id',
    authorize('eliminarRoles'), 
    roleIdParamValidation,         // Middleware de validación para el ID
    roleController.deleteRole
);

// PATCH /api/roles/:id/status - Cambiar el estado de un rol (activo/inactivo)
router.patch(
    '/:id/status',
    authorize('cambiarEstadoRoles'), 
    toggleRoleStatusValidation, // Middleware de validación para el ID y el body status
    roleController.toggleRoleStatus
);

module.exports = router;