// src/controladores/userController.js
const { validationResult } = require('express-validator');
const userService = require('../servicios/userService'); // Asegúrate que la ruta es correcta

// ******** CORRECCIÓN: Añadir la importación del modelo User ********
const { User } = require('../modelos/associations'); // Asegúrate que la ruta es correcta

// Helper para no repetir la exclusión de password y aplanar el rol
const sanitizeUserForResponse = (user) => {
    if (!user) return null;
    // El servicio userService ya devuelve un objeto JSON sanitizado con roleName y roleId
    // así que aquí solo nos aseguramos de que si llega una instancia Sequelize, se convierta
    const userObject = user.toJSON ? user.toJSON() : { ...user };
    delete userObject.password; // Doble seguro
    return userObject;
};

const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.createUser(req.body);
        // userService.createUser ya devuelve un usuario sanitizado
        res.status(201).json({ message: 'Usuario creado exitosamente', user: user });
    } catch (error) {
        console.error("[CTRL createUser] Error:", error.message, error.stack ? error.stack.substring(0,300) : '');
        res.status(error.statusCode || 400).json({ message: error.message || "Error al crear usuario." });
    }
};

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { username, password } = req.body;
        const result = await userService.loginUser(username, password);
        // userService.loginUser ya devuelve un 'user' sanitizado
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso', 
            token: result.token, 
            user: result.user 
        });
    } catch (error) {
        console.error("[CTRL loginUser] Error:", error.message);
        res.status(error.statusCode || 401).json({ message: error.message || "Credenciales incorrectas o error en servidor." });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers(); // El servicio ya sanitiza
        res.status(200).json(users);
    } catch (error) {
        console.error("[CTRL getAllUsers] Error:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Error al obtener la lista de usuarios." });
    }
};

const getUserById = async (req, res) => { // Usado por /api/users/:id
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        // req.foundUser es adjuntado por validateUserExistence en userIdParamValidation (middleware)
        // y es una instancia Sequelize. Lo sanitizamos para la respuesta.
        res.status(200).json(sanitizeUserForResponse(req.foundUser));
    } catch (error) {
        console.error(`[CTRL getUserById ID: ${req.params.id}] Error:`, error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => { // Usado por /api/users/:id (Admin actualizando un usuario)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params; // ID del usuario a actualizar
        const userData = req.body;  // Datos para actualizar
        // req.foundUser es la instancia del usuario a actualizar, cargada por el middleware
        
        console.log(`[CTRL updateUser ID: ${id}] Datos recibidos en body para actualizar:`, JSON.stringify(userData, null, 2));

        const updatedUser = await userService.updateUser(id, userData, req.foundUser);
        // userService.updateUser ya devuelve un usuario sanitizado
        res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        console.error(`[CTRL updateUser ID: ${req.params.id}] Error:`, error.message, error.stack ? error.stack.substring(0,300) : '');
        res.status(error.statusCode || 400).json({ message: error.message || "Error al actualizar el usuario." });
    }
};

const deleteUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { id } = req.params;
        // req.foundUser es la instancia, pasada al servicio
        await userService.deleteUser(id, req.foundUser);
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error(`[CTRL deleteUser ID: ${req.params.id}] Error:`, error.message);
        res.status(error.statusCode || (error.message.includes("no encontrado") ? 404 : 500)).json({ message: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { id } = req.params;
        // req.foundUser es la instancia
        const updatedUser = await userService.toggleUserStatus(id, req.foundUser);
        // userService.toggleUserStatus ya devuelve un usuario sanitizado
        res.status(200).json({
            message: `Estado del usuario ${updatedUser.status ? 'activado' : 'desactivado'} exitosamente.`,
            user: updatedUser
        });
    } catch (error) {
        console.error(`[CTRL toggleUserStatus ID: ${req.params.id}] Error:`, error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// --- Rutas relacionadas con /api/auth ---

const getCurrentUser = async (req, res) => { // Usado por /api/auth/currentuser
    try {
        if (!req.user || !req.user.userId) {
             return res.status(401).json({ message: 'No autenticado o token inválido.' });
        }
        const userId = req.user.userId;
        const user = await userService.getUserById(userId); // El servicio ya sanitiza
        if (!user) { // Doble check, aunque el token debería ser de un usuario existente
            return res.status(404).json({ message: 'Usuario asociado al token no encontrado.'});
        }
        res.status(200).json(user); // userService.getUserById ya sanitiza
    } catch (error) {
        console.error("[CTRL getCurrentUser] Error:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const updateCurrentUser = async (req, res) => { // Usado por /api/auth/updateUser (usuario actualiza su perfil)
    const errors = validationResult(req); // selfUpdateUserProfileValidation
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        if (!req.user || !req.user.userId) {
             return res.status(401).json({ message: 'No autenticado o token inválido.' });
        }
        const userId = req.user.userId;
        const userData = req.body; // Datos validados por selfUpdateUserProfileValidation
        
        // El middleware selfUpdateUserProfileValidation ya previene el envío de password, roleId, status.
        // No es necesario borrarlos aquí de nuevo si la validación es estricta.

        // Obtener la instancia actual del usuario para pasarla al servicio
        // 'User' ahora está definido gracias a la importación al inicio del archivo.
        const userToUpdateInstance = await User.findByPk(userId); 
        if (!userToUpdateInstance) {
            // Esto sería raro si el token es válido y el usuario existe
            return res.status(404).json({message: "Usuario autenticado no encontrado en la base de datos."});
        }

        // Llamar al servicio. El servicio updateUser está diseñado para manejar la actualización
        // de campos permitidos y NO tocará la contraseña, rol o status si no se le indica
        // explícitamente (lo cual no hacemos aquí para el usuario actualizando su propio perfil).
        const updatedUser = await userService.updateUser(userId, userData, userToUpdateInstance);
        // userService.updateUser ya devuelve un usuario sanitizado
        res.status(200).json({ message: 'Perfil actualizado exitosamente', user: updatedUser });
    } catch (error) {
        console.error("[CTRL updateCurrentUser] Error:", error.message, error.stack ? error.stack.substring(0,300) : '');
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

const changePassword = async (req, res) => { // Usado por /api/auth/change-password
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        if (!req.user || !req.user.userId) {
             return res.status(401).json({ message: 'No autenticado o token inválido.' });
        }
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body; // La validación ya verificó la contraseña actual y el formato de la nueva
        
        await userService.changeUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error("[CTRL changePassword] Error:", error.message);
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

const logout = (req, res) => { // Usado por /api/auth/logout
    res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

module.exports = {
    // Para /api/users
    createUser, 
    getAllUsers, 
    getUserById, 
    updateUser, // Para que un Admin actualice /api/users/:id
    deleteUser,
    toggleUserStatus, 
    // Para /api/auth
    loginUser, 
    getCurrentUser, 
    updateCurrentUser, // Para que el usuario actualice su propio perfil /api/auth/updateUser
    changePassword, 
    logout
};