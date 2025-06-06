// src/repositorios/userRepository.js
const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate que la ruta sea correcta
const User = require('../modelos/User');
const Role = require('../modelos/Role');

const createUser = async (userData) => {
    return User.create(userData);
};

const getUserByUsername = async (username) => {
    // console.log(`[userRepository] Buscando usuario con username (case-insensitive): '${username}'`);
    try {
        const user = await User.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('User.username')), username.toLowerCase()), // Calificar username
            include: [{
                model: Role.unscoped(),
                as: 'role',
                attributes: ['id', 'name', 'status'],
                required: false
            }],
            attributes: { exclude: ['password'] }
        });
        // console.log(`[userRepository] Usuario encontrado para '${username}':`, !!user);
        return user;
    } catch (error) {
        console.error(`[userRepository] Error buscando usuario '${username}':`, error);
        throw error;
    }
};

const getAllUsers = async () => {
    return User.findAll({
        include: [{
            model: Role, // Aquí SÍ respeta el defaultScope (roles activos)
            as: 'role',
            attributes: ['id', 'name'],
            required: false // LEFT JOIN
        }],
        attributes: { exclude: ['password'] },
        order: [['nombreCompleto', 'ASC']], // Opcional: ordenar
    });
};

const getUserById = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        return null; // O lanzar error
    }
    return User.findByPk(numericId, {
        include: [{
            model: Role, // Respeta defaultScope
            as: 'role',
            attributes: ['id', 'name'],
            required: false // LEFT JOIN
        }],
        attributes: { exclude: ['password'] }
    });
};

const updateUser = async (id, userData) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        throw new Error("ID de usuario inválido para actualizar.");
    }
    // Excluir campos que no deberían actualizarse masivamente o que requieren lógica especial
    const { password, username, email, status, roleId, ...updatableData } = userData;

    // Solo actualiza si hay datos en updatableData
    if (Object.keys(updatableData).length === 0) {
        console.log(`[UserRepo] updateUser: No hay datos válidos para actualizar para el usuario ID ${id}.`);
        return [0]; // Indica 0 filas afectadas si no hay nada que actualizar
    }
    
    return User.update(updatableData, {
        where: { id: numericId }
    });
};

const deleteUser = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        throw new Error("ID de usuario inválido para eliminar.");
    }
    return User.destroy({
        where: { id: numericId }
    });
};

/**
 * Actualiza el estado de los usuarios que cumplen una condición.
 * @param {object} condition - Objeto de condición para Sequelize (ej. { roleId: 1, status: true }).
 * @param {boolean} newStatusValue - El nuevo valor para el campo 'status' (true o false).
 * @param {object} [transaction=null] - Transacción opcional de Sequelize.
 * @returns {Promise<number>} El número de filas afectadas.
 */
const updateUserStatusByCondition = async (condition, newStatusValue, transaction = null) => {
    console.log(`[UserRepo] updateUserStatusByCondition: Condición:`, condition, `Nuevo estado: ${newStatusValue}`);
    if (typeof newStatusValue !== 'boolean') {
        throw new Error('El nuevo estado (newStatusValue) debe ser un valor booleano.');
    }
    try {
        // Asegurarse de que la condición no esté vacía para evitar actualizar todos los usuarios accidentalmente
        if (!condition || Object.keys(condition).length === 0) {
            throw new Error('La condición para actualizar el estado de los usuarios no puede estar vacía.');
        }

        const [affectedRows] = await User.update(
            { status: newStatusValue },
            {
                where: condition,
                transaction: transaction,
            }
        );
        console.log(`[UserRepo] updateUserStatusByCondition: ${affectedRows} usuarios actualizados.`);
        return affectedRows;
    } catch (error) {
        console.error('[UserRepo] Error en updateUserStatusByCondition:', error);
        throw new Error(`Error al actualizar el estado de los usuarios por condición: ${error.message}`);
    }
};
const findByEmail = async (email) => {
    try {
        return await User.findOne({
            where: { email: email.toLowerCase() } // Normalizar email a minúsculas para la búsqueda
        });
        // No se necesita incluir el rol para esta operación.
    } catch (error) {
        console.error(`[userRepository] Error buscando usuario por email '${email}':`, error);
        throw error;
    }
};
const findByUsernameWithRole = async (username) => {
    try {
        const user = await User.findOne({
            where: { username: username }, // Asumiendo que el username es exacto o ya normalizado
            include: [{
                model: Role, // Aquí SÍ puede usar el defaultScope de Role si quieres solo roles activos
                as: 'role', // Asegúrate que esto coincida con tu asociación
                attributes: ['id', 'name', 'status'], // Incluir status del rol
                required: true // INNER JOIN, un usuario DEBE tener un rol para loguearse
                               // O false si quieres permitir usuarios sin rol (LEFT JOIN) y manejarlo en el servicio
            }]
            // No excluimos la contraseña aquí porque el servicio de login la usará para comparar
        });
        if (user && !user.Role) { // Si es LEFT JOIN y no encontró rol, o el rol está inactivo (si Role tiene defaultScope)
            console.warn(`[UserRepo] Usuario ${username} encontrado pero sin rol asociado o rol inactivo.`);
            // Podrías retornar null o el usuario sin rol para que el servicio decida.
            // Para login, es mejor ser estricto o que el servicio maneje el caso "rol inactivo".
            // Si required: true, este caso no debería darse, findOne devolvería null.
        }
        return user;
    } catch (error) {
        console.error(`[userRepository] Error en findByUsernameWithRole para '${username}':`, error);
        throw error;
    }
};

module.exports = {
    createUser,
    getUserByUsername,
    getAllUsers,
    getUserById,
    findByUsernameWithRole, // <--- Asegúrate de exportar este
    findByEmail,          // <--- Asegúrate de exportar este
    updateUser,
    deleteUser,
    updateUserStatusByCondition, // Asegúrate que esta línea esté aquí
};