// src/middlewares/authValidators.js
const { body, param } = require('express-validator');

const forgotPasswordValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es requerido.')
        .isString().withMessage('El nombre de usuario debe ser una cadena de texto.'),
    body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es requerido.')
        .isEmail().withMessage('Por favor, ingrese un correo electrónico válido.')
];


const resetPasswordValidator = [
    // Asumimos que el token vendrá en la URL como parámetro
    param('token')
        .trim()
        .notEmpty().withMessage('El token de restablecimiento es requerido.')
        .isHexadecimal().withMessage('El token debe tener un formato hexadecimal.')
        .isLength({ min: 64, max: 64 }).withMessage('Formato de token inválido (longitud incorrecta para 32 bytes hexadecimales).'), // 32 bytes * 2 caracteres hex = 64

    body('newPassword')
        .trim()
        .notEmpty().withMessage('La nueva contraseña es requerida.')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
        // Puedes añadir más reglas de complejidad si lo deseas:
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número.')
        .matches(/[a-zA-Z]/).withMessage('La contraseña debe contener al menos una letra.')
];

// Si decidieras pasar el token en el body para la ruta /reset-password:
/*
const resetPasswordValidatorWithTokenInBody = [
    body('token')
        .trim()
        .notEmpty().withMessage('El token es requerido.')
        .isHexadecimal().withMessage('El token debe ser hexadecimal.')
        .isLength({ min: 64, max: 64 }).withMessage('Formato de token inválido.'),
    body('newPassword')
        .trim()
        .notEmpty().withMessage('La nueva contraseña es requerida.')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];
*/

module.exports = {
    forgotPasswordValidator,
    resetPasswordValidator,
};