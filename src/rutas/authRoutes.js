// src/rutas/authRoutes.js
const express = require('express');
const router = express.Router();

// --- Controladores ---
const userController = require('../controladores/userController'); // Para login, register, perfil, etc.
const authController = require('../controladores/authController'); // Para forgot-password, reset-password

// --- Middlewares de Autenticación ---
const { authenticate } = require('../middlewares/auth');

// --- Validadores ---
// Validadores para operaciones de usuario (login, registro, perfil, cambio de pass logueado)
const {
    createUserValidation,
    loginUserValidation,
    selfUpdateUserProfileValidation, // Asumo que este es para actualizar el perfil del propio usuario
    changePasswordValidation         // Para cuando el usuario ESTÁ logueado y cambia su propia contraseña
} = require('../middlewares/userValidations'); // ASUMO QUE ESTE ARCHIVO EXISTE Y EXPORTA ESTOS

// Validadores específicos para el flujo de recuperación de contraseña
const {
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../middlewares/authValidators'); // ESTE ES EL ARCHIVO QUE CREAMOS PARA ESTO

// POST /api/auth/register
router.post('/register', createUserValidation, userController.createUser);

// POST /api/auth/login
router.post('/login', loginUserValidation, userController.loginUser);

// 1. POST /api/auth/forgot-password
//    Solicitar el envío del correo de restablecimiento
router.post(
    '/forgot-password',
    forgotPasswordValidator,     // Valida 'username' y 'email' en el body
    authController.handleForgotPassword // Usa el controlador de auth para esta lógica
);

// 2. GET /api/auth/verify-reset-token/:token (Opcional, pero útil para el frontend)
//    Verificar la validez de un token antes de mostrar el formulario de nueva contraseña
router.get(
    '/verify-reset-token/:token',
    // Podrías añadir un validador de 'param' aquí si quieres ser muy estricto
    // con el formato del token antes de que llegue al controlador.
    authController.handleVerifyResetToken // Usa el controlador de auth
);

// 3. POST /api/auth/reset-password/:token
//    Establecer la nueva contraseña usando el token
router.post(
    '/reset-password/:token',
    resetPasswordValidator,       // Valida el token en params y newPassword en el body
    authController.handleResetPassword // Usa el controlador de auth
);
// GET /api/auth/currentuser
// Obtener información del usuario actual (perfil)
router.get('/currentuser', authenticate, userController.getCurrentUser);

// PUT /api/auth/updateUser
// Actualizar información (perfil) del usuario actual
router.put('/updateUser',
    authenticate,
    selfUpdateUserProfileValidation, // Validador para los datos del perfil
    userController.updateCurrentUser
);

// POST /api/auth/change-password
// Cambiar la contraseña del usuario actual (estando logueado)
router.post('/change-password',
    authenticate,
    changePasswordValidation,
    userController.changePassword
);

// POST /api/auth/logout
// Cerrar sesión (la lógica real suele estar en el frontend al borrar el token,
// pero el backend puede tener un endpoint para registrar el logout o invalidar tokens de refresh si los usas)
router.post('/logout', authenticate, userController.logout); // Asumo que userController.logout existe

module.exports = router;