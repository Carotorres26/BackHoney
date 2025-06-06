// src/rutas/userManagementRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controladores/userController');
const {
    adminUpdateUserValidation,
    userIdParamValidation // <--- IMPORTAR CON EL NOMBRE CORRECTO
} = require('../middlewares/userValidations');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// GET /users - Obtener todos los usuarios (para admin)
router.get('/',
    authorize('acceso_usuarios'),
    userController.getAllUsers
);

// GET /users/:id - Obtener un usuario por ID (para admin)
router.get('/:id',
    authorize('acceso_usuarios'), 
    userIdParamValidation, // <--- USAR EL NOMBRE CORRECTO AQUÍ
    userController.getUserById
);

// PUT /users/:id - Actualizar un usuario por ID (para admin)
router.put('/:id',
    authorize('editarUsuarios'),
    adminUpdateUserValidation, 
    userController.updateUser
);

// DELETE /users/:id - Eliminar un usuario por ID (para admin)
router.delete('/:id',
    authorize('eliminarUsuarios'),
    userIdParamValidation, // <--- Y AQUÍ
    userController.deleteUser
);

// PATCH /users/:id/status - Cambiar estado de un usuario (para admin)
router.patch('/:id/status',
    authorize('cambiarEstadoUsuarios'),
    userIdParamValidation, // <--- Y AQUÍ
    userController.toggleUserStatus
);

module.exports = router;