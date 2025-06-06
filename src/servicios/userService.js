// src/servicios/userService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Op } = require('../modelos/associations'); // Asegúrate que esta ruta es correcta
const secretKey = process.env.JWT_SECRET || 'tu_jwt_secret_por_defecto_para_desarrollo';

if (!secretKey && process.env.NODE_ENV !== 'test') {
    console.error("FATAL ERROR: JWT_SECRET no está definida. La aplicación no funcionará correctamente.");
}

// Helper para sanitizar el usuario antes de devolverlo
const sanitizeUser = (userInstance) => {
    if (!userInstance) return null;
    const userJson = userInstance.toJSON ? userInstance.toJSON() : { ...userInstance };
    delete userJson.password; 
    if (userJson.role && typeof userJson.role === 'object') {
        userJson.roleName = userJson.role.name;
        userJson.roleId = userJson.role.id;
        // delete userJson.role; // Descomentar si solo quieres roleName y roleId, no el objeto anidado
    }
    // 'celular' ya está en userJson si existe en userInstance, no se necesita acción específica aquí
    return userJson;
};

const createUser = async (userData) => {
    const { nombreCompleto, documento, email, celular, username, password, roleId, status } = userData;

    const existingUser = await User.unscoped().findOne({
        where: {
            [Op.or]: [
                { username: username },
                { email: email },
                { documento: documento }
            ]
        }
    });
    if (existingUser) {
        let field = '';
        if (existingUser.username === username) field = 'nombre de usuario';
        else if (existingUser.email === email) field = 'correo electrónico';
        else if (existingUser.documento === documento) field = 'documento';
        const error = new Error(`El ${field} '${existingUser[field === 'nombre de usuario' ? 'username' : field]}' ya está registrado.`);
        error.statusCode = 409;
        throw error;
    }

    const role = await Role.unscoped().findByPk(roleId);
    if (!role) {
        const error = new Error('El rol especificado no existe.');
        error.statusCode = 400;
        throw error;
    }
    if (role.status !== true && role.id !== 1) {
        const error = new Error(`El rol '${role.name}' está inactivo y no se puede asignar.`);
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({
            nombreCompleto,
            documento,
            email,
            celular: celular || null, // Correcto: guarda null si celular es falsy
            username,
            password: hashedPassword,
            roleId,
            status: status !== undefined ? status : true,
        });
        const userWithDetails = await User.findByPk(newUser.id, {
            include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }],
        });
        return sanitizeUser(userWithDetails);
    } catch (error) {
        console.error("Error en servicio al crear usuario:", error);
        throw new Error(error.message || "Error interno al crear el usuario.");
    }
};

const loginUser = async (usernameInput, passwordInput) => {
    if (!usernameInput || !passwordInput) {
        const error = new Error('Nombre de usuario y contraseña son requeridos.');
        error.statusCode = 400;
        throw error;
    }
    const userInstance = await User.unscoped().findOne({
        where: { username: usernameInput },
        include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }]
    });

    if (!userInstance) {
        const error = new Error('Credenciales inválidas (usuario no encontrado).'); error.statusCode = 401; throw error;
    }
    if (!userInstance.status) {
        const error = new Error('Su cuenta de usuario está inactiva. Por favor, contacte al administrador.'); error.statusCode = 403; throw error;
    }
    if (!userInstance.role) {
        const error = new Error('El usuario no tiene un rol asignado. Contacte al administrador.'); error.statusCode = 403; throw error;
    }
    if (userInstance.role.status !== true) {
        const error = new Error('El rol asignado a su cuenta está inactivo. Contacte al administrador.'); error.statusCode = 403; throw error;
    }

    const isMatch = await bcrypt.compare(passwordInput, userInstance.password);
    if (!isMatch) {
        const error = new Error('Credenciales inválidas (contraseña incorrecta).'); error.statusCode = 401; throw error;
    }

    const payload = {
        userId: userInstance.id,
        username: userInstance.username,
        role: userInstance.role.name,
        roleId: userInstance.role.id
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    
    return { token, user: sanitizeUser(userInstance) }; // sanitizeUser pasará 'celular' si existe
};

const getAllUsers = async () => {
    const users = await User.unscoped().findAll({
        include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }],
        order: [['nombreCompleto', 'ASC']]
    });
    return users.map(sanitizeUser); // sanitizeUser pasará 'celular' de cada usuario
};

const getUserById = async (id) => {
    const userInstance = await User.unscoped().findByPk(id, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }]
    });
    if (!userInstance) {
        return null; 
    }
    return sanitizeUser(userInstance); // sanitizeUser pasará 'celular' si existe
};

const updateUser = async (userId, userData, userInstance = null) => {
    const user = userInstance || await User.unscoped().findByPk(userId);
    if (!user) {
        const error = new Error('Usuario no encontrado para actualizar.');
        error.statusCode = 404;
        throw error;
    }

    // Definimos los campos que se pueden actualizar. 'celular' está incluido.
    const updatableFields = ['nombreCompleto', 'documento', 'email', 'celular', 'username', 'roleId'];
    
    for (const field of updatableFields) {
        if (userData.hasOwnProperty(field)) { // Solo si el campo viene en userData
            if (['username', 'email', 'documento'].includes(field) && userData[field] !== user[field]) {
                const existingConflict = await User.unscoped().findOne({
                    where: {
                        [field]: userData[field],
                        id: { [Op.ne]: userId }
                    }
                });
                if (existingConflict) {
                    const friendlyFieldName = field === 'username' ? 'nombre de usuario' : field;
                    const error = new Error(`El ${friendlyFieldName} '${userData[field]}' ya está en uso.`);
                    error.statusCode = 409;
                    throw error;
                }
            }
            if (field === 'roleId' && userData.roleId !== user.roleId) {
                const role = await Role.unscoped().findByPk(userData.roleId);
                if (!role) {
                    const error = new Error(`El rol con ID ${userData.roleId} no existe.`);
                    error.statusCode = 400; throw error;
                }
                if (role.status !== true && role.id !== 1) {
                    const error = new Error(`El rol '${role.name}' está inactivo y no se puede asignar.`);
                    error.statusCode = 400; throw error;
                }
            }
            // Lógica para 'celular': si se envía cadena vacía, se guarda null.
            // Si se envía un valor, se guarda ese valor. Si no se envía, no se toca.
            if (field === 'celular') {
                user.celular = userData.celular === '' ? null : (userData.celular || user.celular); // Si userData.celular es undefined, mantiene el valor actual
            } else {
                user[field] = userData[field];
            }
        }
    }

    if (userData.password && typeof userData.password === 'string' && userData.password.trim() !== "") {
        console.log(`[UserService updateUser ID: ${userId}] Actualizando contraseña.`);
        user.password = await bcrypt.hash(userData.password.trim(), 10);
    }

    try {
        await user.save();
        const updatedUserWithDetails = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }]
        });
        return sanitizeUser(updatedUserWithDetails); // sanitizeUser pasará 'celular'
    } catch (error) {
        console.error("Error en servicio al actualizar usuario:", error);
        throw new Error(error.message || "Error interno al actualizar el usuario.");
    }
};

const deleteUser = async (userId, userInstance = null) => {
    const user = userInstance || await User.unscoped().findByPk(userId);
    if (!user) {
        const error = new Error('Usuario no encontrado para eliminar.');
        error.statusCode = 404;
        throw error;
    }
    await user.destroy();
    return true;
};

const toggleUserStatus = async (userId, userInstance = null) => {
    const user = userInstance || await User.unscoped().findByPk(userId);
    if (!user) {
        const error = new Error('Usuario no encontrado para cambiar estado.');
        error.statusCode = 404;
        throw error;
    }
    user.status = !user.status;
    await user.save();
    
    const userWithDetails = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'status'] }]
    });
    return sanitizeUser(userWithDetails); // sanitizeUser pasará 'celular'
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('Usuario no encontrado.'); error.statusCode = 404; throw error;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return true;
};

module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changeUserPassword,
};