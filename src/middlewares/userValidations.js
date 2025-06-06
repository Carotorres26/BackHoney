// src/middlewares/userValidations.js
const { body, param } = require('express-validator');
const { User, Role } = require('../modelos/associations'); // Ajusta la ruta a tus modelos
const { Op } = require('sequelize'); // <--- IMPORTACIÓN DIRECTA DE Op
const bcrypt = require('bcryptjs');

// --- Helpers ---
const validateUniqueUserField = async (value, { fieldName, friendlyName, req }) => {
    if (!value && typeof value !== 'string') return true; 
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    
    if (!trimmedValue && fieldName !== 'celular') { 
        return true; 
    }
    if (!trimmedValue && fieldName === 'celular') return true;

    const whereCondition = { [fieldName]: trimmedValue };
    const userIdToExclude = req.params.id ? parseInt(req.params.id, 10) : null;
    const currentAuthUserId = req.user?.userId || req.user?.id;
    let idToExclude = null;

    if (userIdToExclude && !isNaN(userIdToExclude) && req.originalUrl.startsWith('/api/users/')) {
        idToExclude = userIdToExclude;
    } else if (currentAuthUserId && req.originalUrl.startsWith('/api/auth/updateUser')) {
        idToExclude = currentAuthUserId;
    }

    if (idToExclude) {
        whereCondition.id = { [Op.ne]: idToExclude }; // Op ahora debería estar definido
    }

    const existingUser = await User.unscoped().findOne({ where: whereCondition });
    if (existingUser) {
        throw new Error(`El ${friendlyName} '${trimmedValue}' ya está registrado.`);
    }
    return true;
};

const validateRoleExistsAndIsActiveForAssignment = async (roleId) => {
    if (roleId === null || roleId === undefined || roleId === '') return true; 
    const id = parseInt(roleId, 10);
    if (isNaN(id) || id <= 0) throw new Error('ID de rol inválido. Debe ser un número entero positivo.');

    const role = await Role.unscoped().findByPk(id);
    if (!role) {
        throw new Error(`El rol seleccionado con ID ${id} no existe.`);
    }
    if (role.status !== true && role.id !== 1) { 
        // throw new Error(`El rol '${role.name}' (ID ${id}) está inactivo y no se puede asignar.`);
    }
    return true;
};


const validateUserExistence = async (id, req) => {
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
        throw new Error('ID de usuario inválido en la validación de existencia.');
    }
    const user = await User.unscoped().findByPk(userId);
    if (!user) {
        throw new Error(`El usuario con ID ${userId} no existe.`);
    }
    if (req) { 
        req.foundUser = user;
    }
    return true;
};
// --- Fin Helpers ---

const createUserValidation = [
    body('nombreCompleto').trim().notEmpty().withMessage('El nombre completo es requerido.')
        .isString().withMessage('El nombre completo debe ser texto.')
        .isLength({ min: 3, max: 150 }).withMessage('El nombre completo debe tener entre 3 y 150 caracteres.'),
    body('documento').trim().notEmpty().withMessage('El número de documento es requerido.')
        .isString().withMessage('El número de documento debe ser texto.')
        .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres.')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'documento', friendlyName: 'número de documento', req })),
    body('email').trim().notEmpty().withMessage('El correo electrónico es requerido.')
        .isEmail().withMessage('El formato del correo electrónico no es válido (ej: usuario@dominio.com).')
        .normalizeEmail().custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'email', friendlyName: 'correo electrónico', req })),
    body('celular').optional({ checkFalsy: true }).trim()
        .if(body('celular').notEmpty())
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.')
        .isLength({ min: 7, max: 20 }).withMessage('El número de celular debe tener entre 7 y 20 dígitos.')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'celular', friendlyName: 'número de celular', req })),
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido.')
        .isString().withMessage('El nombre de usuario debe ser texto.')
        .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres.')
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('El nombre de usuario solo puede contener letras, números y los caracteres: _ . -')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'username', friendlyName: 'nombre de usuario', req })),
    body('password').notEmpty().withMessage('La contraseña es requerida.')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
        .withMessage('La contraseña debe ser fuerte: al menos una minúscula, una mayúscula, un número y un carácter especial.'),
    body('roleId').notEmpty().withMessage('Debe seleccionar un rol para el usuario.')
        .isInt({ gt: 0 }).withMessage('El ID del rol seleccionado no es válido.').custom(validateRoleExistsAndIsActiveForAssignment),
    body('status').optional().isBoolean().withMessage('El estado debe ser un valor booleano (true o false).').toBoolean()
];

const loginUserValidation = [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es requerido.'),
    body('password').notEmpty().withMessage('La contraseña es requerida.')
];

const adminUpdateUserValidation = [
    param('id').isInt({ gt: 0 }).withMessage('El ID del usuario en la URL no es válido.')
        .custom((id, { req }) => validateUserExistence(id, req)),
    body('nombreCompleto').optional().trim().notEmpty().withMessage('Si se envía, el nombre completo no puede estar vacío.').isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres.'),
    body('documento').optional().trim().notEmpty().withMessage('Si se envía, el documento no puede estar vacío.').isLength({ min: 5, max: 20 }).withMessage('El documento debe tener entre 5 y 20 caracteres.')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'documento', friendlyName: 'documento', req })),
    body('email').optional().trim().notEmpty().withMessage('Si se envía, el correo no puede estar vacío.').isEmail().withMessage('Formato de correo inválido.').normalizeEmail()
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'email', friendlyName: 'correo', req })),
    body('celular').optional({ nullable: true, checkFalsy: true }).trim()
        .if(body('celular').notEmpty())
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no parece válido.')
        .isLength({ min: 7, max: 20 }).withMessage('El número de celular debe tener entre 7 y 20 dígitos.')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'celular', friendlyName: 'celular', req })),
    body('username').optional().trim().notEmpty().withMessage('Si se envía, el nombre de usuario no puede estar vacío.').isLength({ min: 3, max: 30 }).withMessage('Username entre 3 y 30 caracteres.').matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username solo letras, números, _, ., -')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'username', friendlyName: 'nombre de usuario', req })),
    body('password')
        .optional()
        .if(body('password').exists({ checkFalsy: false }).notEmpty())
        .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
        .withMessage('La nueva contraseña debe ser fuerte: al menos una minúscula, una mayúscula, un número y un carácter especial.'),
    body('roleId').optional().isInt({ gt: 0 }).withMessage('Si se envía, el ID del rol no es válido.').custom(validateRoleExistsAndIsActiveForAssignment),
    body('status').optional().isBoolean().withMessage('Si se envía, el estado debe ser booleano.').toBoolean()
];

const selfUpdateUserProfileValidation = [ 
    body('nombreCompleto').optional().trim().notEmpty().withMessage('Si se envía, el nombre completo no puede estar vacío.').isLength({ min: 3, max: 150 }),
    body('documento').optional().trim().notEmpty().withMessage('Si se envía, el documento no puede estar vacío.').isLength({ min: 5, max: 20 })
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'documento', friendlyName: 'documento', req })),
    body('email').optional().trim().notEmpty().withMessage('Si se envía, el correo no puede estar vacío.').isEmail().normalizeEmail()
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'email', friendlyName: 'correo', req })),
    body('celular').optional({ nullable: true, checkFalsy: true }).trim()
        .if(body('celular').notEmpty())
        .isMobilePhone('any', { strictMode: false }).withMessage('El número de celular no es válido.')
        .isLength({ min: 7, max: 20 }).withMessage('Celular entre 7 y 20 dígitos.')
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'celular', friendlyName: 'celular', req })),
    body('username').optional().trim().notEmpty().withMessage('Si se envía, el nombre de usuario no puede estar vacío.').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_.-]+$/)
        .custom((value, { req }) => validateUniqueUserField(value, { fieldName: 'username', friendlyName: 'nombre de usuario', req })),
    body('password').not().exists().withMessage('Para cambiar la contraseña, use la ruta específica de cambio de contraseña.'),
    body('roleId').not().exists().withMessage('El rol no puede ser modificado por el propio usuario desde esta ruta.'),
    body('status').not().exists().withMessage('El estado no puede ser modificado por el propio usuario desde esta ruta.'),
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida.')
        .custom(async (value, { req }) => {
            const userId = req.user?.userId || req.user?.id;
            if (!userId) throw new Error('No autenticado.');
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Usuario no encontrado.');
            const isMatch = await bcrypt.compare(value, user.password);
            if (!isMatch) throw new Error('La contraseña actual ingresada es incorrecta.');
            return true;
        }),
    body('newPassword').notEmpty().withMessage('La nueva contraseña es requerida.')
        .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
        .withMessage('La nueva contraseña debe ser fuerte: minúscula, mayúscula, número y carácter especial.')
        .custom((value, { req }) => { if (value === req.body.currentPassword) throw new Error('La nueva contraseña no puede ser igual a la contraseña actual.'); return true; }),
    body('confirmPassword').notEmpty().withMessage('Debe confirmar la nueva contraseña.')
        .custom((value, { req }) => { if (value !== req.body.newPassword) throw new Error('La nueva contraseña y la confirmación no coinciden.'); return true; })
];

const userIdParamValidation = [ 
    param('id').isInt({ gt: 0 }).withMessage('El ID del usuario en la URL debe ser un entero positivo.')
        .custom((id, { req }) => validateUserExistence(id, req))
];

module.exports = {
    createUserValidation,
    loginUserValidation,
    adminUpdateUserValidation,
    selfUpdateUserProfileValidation,
    changePasswordValidation,
    userIdParamValidation
};