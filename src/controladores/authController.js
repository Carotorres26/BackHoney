// src/controladores/authController.js
const authService = require('../servicios/authService'); // Usamos el nuevo authService
const { validationResult } = require('express-validator');
// Si vas a implementar auto-login después del reseteo, necesitarás esto:
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para JWT_SECRET

// --- NUEVAS FUNCIONES PARA RECUPERAR CONTRASEÑA ---

/**
 * Maneja la solicitud para iniciar el proceso de restablecimiento de contraseña.
 * Recibe un 'identifier' (username o email) y llama al servicio para enviar el correo.
 */
// src/controladores/authController.js
const handleForgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body; // <--- Ahora obtenemos ambos
    try {
        await authService.requestPasswordReset(username, email); // <--- Pasamos ambos al servicio
        res.status(200).json({ 
            message: 'Si tu nombre de usuario y correo electrónico están registrados y coinciden, recibirás un correo electrónico con instrucciones para restablecer tu contraseña en breve.' 
        });
    } catch (error) {
        console.error('[authController.handleForgotPassword] Error:', error.message);
        res.status(500).json({ 
            message: error.message || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.' 
        });
    }
};
/**
 * (Opcional) Maneja la verificación de un token de restablecimiento.
 * Útil si el frontend quiere validar el token antes de mostrar el formulario de nueva contraseña.
 */
const handleVerifyResetToken = async (req, res) => {
    const { token } = req.params;
    try {
        await authService.verifyResetToken(token); // Solo verifica, no hace más
        res.status(200).json({ message: 'Token válido y listo para usar.' });
    } catch (error) {
        // authService.verifyResetToken lanza error si es inválido o expirado
        console.error('[authController.handleVerifyResetToken] Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Maneja el restablecimiento final de la contraseña.
 * Recibe el token y la nueva contraseña.
 */
const handleResetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params; // Asumiendo que el token viene como parámetro en la URL
    const { newPassword } = req.body;

    try {
        const updatedUser = await authService.resetPassword(token, newPassword);

        // OPCIONAL: Implementar auto-login aquí si lo deseas
        const tokenPayload = { userId: updatedUser.id, username: updatedUser.username, /* ...otros datos... */ };
        const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
             message: 'Tu contraseña ha sido actualizada exitosamente.',
             token: jwtToken, // Para auto-login
             user: { id: updatedUser.id, username: updatedUser.username, /* ...otros datos... */ }
        });

    } catch (error) {
        // authService.resetPassword lanza error si el token es inválido, expirado o hay otro problema.
        console.error('[authController.handleResetPassword] Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    handleForgotPassword,
    handleVerifyResetToken,
    handleResetPassword,
};