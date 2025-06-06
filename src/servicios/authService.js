// src/servicios/authService.js
// const jwt = require('jsonwebtoken'); // <--- ELIMINADO O COMENTADO si no hay auto-login inmediato
const bcrypt = require('bcryptjs');    // <--- ESTA ES LA IMPORTANTE PARA EL ERROR ACTUAL
const crypto = require('crypto');
const { Op } = require('sequelize');
require('dotenv').config(); // Para FRONTEND_URL y credenciales de email (aunque emailSender lo usa más directamente)

const userRepository = require('../repositorios/userRepository');
const User = require('../modelos/User');
const { sendPasswordResetEmail } = require('../utils/emailSender');

/**
 * Solicita el restablecimiento de contraseña para un usuario.
 * @param {string} username - El nombre de usuario.
 * @param {string} email - El correo electrónico del usuario.
 */
const requestPasswordReset = async (username, email) => {
    console.log(`[authService.requestPasswordReset] Solicitud para username: '${username}' y email: '${email}'`);
    
    const user = await User.findOne({
        where: {
            username: username,
            email: email.toLowerCase()
        }
    });

    if (!user) {
        console.warn(`[authService.requestPasswordReset] No se encontró usuario con username '${username}' Y email '${email.toLowerCase()}'. No se enviará correo.`);
        return; 
    }

    if (!user.status) {
        console.warn(`[authService.requestPasswordReset] Cuenta para username '${username}' (ID: ${user.id}) está inactiva. No se enviará correo.`);
        return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hora

    // Asegúrate que userRepository.updateUser maneja bien los datos o usa user.set() y user.save()
    await userRepository.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpires
    });
    // Alternativamente, si prefieres trabajar con la instancia directamente y tienes la certeza
    // de que el userRepository no hará nada extraño con los campos:
    // user.set({
    //     passwordResetToken: resetToken,
    //     passwordResetExpires: resetTokenExpires
    // });
    // await user.save();

    console.log(`[authService.requestPasswordReset] Token de reseteo generado y guardado para usuario ID: ${user.id}`);

    try {
        await sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (emailError) {
        console.error(`[authService.requestPasswordReset] Fallo al enviar email para usuario ID ${user.id}:`, emailError.message);
        throw emailError;
    }
};

/**
 * Verifica si un token de restablecimiento es válido y no ha expirado.
 * @param {string} token - El token de restablecimiento.
 * @returns {Promise<User>} La instancia del usuario si el token es válido.
 */
const verifyResetToken = async (token) => {
    console.log(`[authService.verifyResetToken] Verificando token: '${token ? token.substring(0, 10) + '...' : 'TOKEN_NULO_O_VACIO'}'`);
    if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Token no proporcionado o en formato incorrecto.');
    }

    const user = await User.findOne({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!user) {
        console.warn(`[authService.verifyResetToken] Token '${token.substring(0,10)}...' inválido o expirado.`);
        throw new Error('El token de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo.');
    }

    console.log(`[authService.verifyResetToken] Token válido para usuario ID: ${user.id}`);
    return user;
};

/**
 * Restablece la contraseña del usuario usando un token válido.
 * @param {string} token - El token de restablecimiento.
 * @param {string} newPassword - La nueva contraseña (en texto plano).
 * @returns {Promise<Object>} Un objeto del usuario sin la contraseña.
 */
const resetPassword = async (token, newPassword) => {
    console.log(`[authService.resetPassword] Intentando restablecer contraseña con token: '${token ? token.substring(0,10)+'...' : 'TOKEN_NULO_O_VACIO'}'`);
    const userInstance = await verifyResetToken(token);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la instancia del usuario directamente es más seguro aquí
    // para asegurar que los campos correctos se actualizan y se guardan.
    userInstance.password = hashedPassword;
    userInstance.passwordResetToken = null;
    userInstance.passwordResetExpires = null;
    await userInstance.save(); // Esto guardará los cambios en la BD.

    // Alternativamente, si confías en que userRepository.updateUser no tiene efectos secundarios
    // y actualiza correctamente CUALQUIER campo que le pases:
    // await userRepository.updateUser(userInstance.id, {
    //     password: hashedPassword,
    //     passwordResetToken: null,
    //     passwordResetExpires: null
    // });

    console.log(`[authService.resetPassword] Contraseña restablecida y token limpiado para usuario ID: ${userInstance.id}`);

    return {
        id: userInstance.id,
        username: userInstance.username,
        email: userInstance.email,
        nombreCompleto: userInstance.nombreCompleto
    };
};

module.exports = {
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
};