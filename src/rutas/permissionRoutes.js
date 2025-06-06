// src/rutas/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controladores/permissionController');
const { 
    createPermissionValidation, 
    updatePermissionValidation, 
    permissionIdParamValidation // Usaremos esta para GET por ID y DELETE
} = require('../middlewares/permissionValidations'); // Ajusta la ruta si es necesario
const { authenticate, authorize } = require('../middlewares/auth'); // Ajusta la ruta

router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en permissionRoutes: ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') console.log(`>>> Body:`, req.body);
    next();
});

router.use(authenticate); // Aplicar autenticación a todas las rutas de permisos

// POST /api/permissions - Crear un nuevo permiso
router.post('/', 
    authorize('crearPermisos'), // Necesitarás un permiso 'crearPermisos' o similar
    createPermissionValidation, 
    permissionController.createPermission
);

// GET /api/permissions - Obtener todos los permisos
router.get('/', 
    authorize('acceso_permisos'), // Este es el permiso que fallaba
    permissionController.getAllPermissions
);

// GET /api/permissions/:id - Obtener un permiso por ID
router.get('/:id', 
    authorize('acceso_permisos'), // O 'ver_detalle_permiso'
    permissionIdParamValidation, 
    permissionController.getPermissionById
);

// PUT /api/permissions/:id - Actualizar un permiso
router.put('/:id', 
    authorize('actualizarPermisos'), // Necesitarás un permiso 'actualizarPermisos'
    updatePermissionValidation, 
    permissionController.updatePermission
);

// DELETE /api/permissions/:id - Eliminar un permiso
router.delete('/:id', 
    authorize('eliminarPermisos'), // Necesitarás un permiso 'eliminarPermisos'
    permissionIdParamValidation, 
    permissionController.deletePermission
);

module.exports = router;