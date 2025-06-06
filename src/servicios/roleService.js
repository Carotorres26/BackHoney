// src/servicios/roleService.js
const { Role, Permission, User } = require('../modelos/associations'); // Ajusta la ruta
const { Op } = require('sequelize'); // <--- IMPORTANTE: Importar Op directamente

// Función auxiliar para obtener IDs de permisos a partir de sus nombres
const getPermissionIdsFromNames = async (permissionNames = []) => {
    if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
        return [];
    }
    const trimmedNames = permissionNames.map(name => typeof name === 'string' ? name.trim() : '').filter(name => name);
    if (trimmedNames.length === 0) return [];

    console.log('[SVC getPermissionIdsFromNames] Buscando IDs para nombres:', trimmedNames);
    const permissions = await Permission.findAll({
        where: { name: { [Op.in]: trimmedNames } }, // Op.in se usa aquí
        attributes: ['id', 'name']
    });
    
    if (permissions.length !== trimmedNames.length) {
        const foundNames = permissions.map(p => p.name);
        const notFound = trimmedNames.filter(name => !foundNames.includes(name));
        console.warn(`[SVC getPermissionIdsFromNames] Nombres de permiso no encontrados en DB: ${notFound.join(', ')}`);
        // No lanzar error aquí, la validación de express-validator ya debería haberlo hecho
        // o el proceso de creación/actualización puede decidir qué hacer.
    }
    return permissions.map(p => p.id);
};

const transformRoleForOutput = (roleInstance) => {
    if (!roleInstance) return null;
    const plainRole = roleInstance.toJSON ? roleInstance.toJSON() : { ...roleInstance };
    if (plainRole.permissions && Array.isArray(plainRole.permissions)) {
        plainRole.permissions = plainRole.permissions.map(p => p.name); // Devolver nombres al frontend
    } else {
        plainRole.permissions = [];
    }
    return plainRole;
};

const getRoleById = async (id) => {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId) || roleId <= 0) {
        const error = new Error("ID de rol inválido proporcionado.");
        error.statusCode = 400;
        throw error;
    }
    try {
        const role = await Role.unscoped().findByPk(roleId, {
            include: [{
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'name'], // Traer id y name
                through: { attributes: [] }
            }]
        });
        if (!role) {
            const error = new Error("Rol no encontrado.");
            error.statusCode = 404;
            throw error;
        }
        return transformRoleForOutput(role);
    } catch (error) {
        if (!error.statusCode) {
            console.error(`Error en roleService.getRoleById (ID: ${id}):`, error);
            error.statusCode = 500;
        }
        throw error;
    }
};

const createRole = async (name, permissionNames = [], statusInput = true) => {
    try {
        const roleData = { name: name.trim() };
        roleData.status = statusInput === false ? false : true;

        console.log('[SVC createRole] Intentando crear rol con datos:', roleData);
        const newRole = await Role.create(roleData);
        
        const permissionIdsToAssociate = await getPermissionIdsFromNames(permissionNames);
        console.log('[SVC createRole] IDs de permisos a asociar:', permissionIdsToAssociate);

        if (permissionIdsToAssociate.length > 0) {
            await newRole.setPermissions(permissionIdsToAssociate);
        }
        console.log('[SVC createRole] Rol creado y permisos asociados. Obteniendo rol completo...');
        return getRoleById(newRole.id);
    } catch (error) {
        console.error("[SVC createRole] Catch Error:", error.message, error.name);
        if (error.name === 'SequelizeUniqueConstraintError') {
             const err = new Error(`El nombre de rol '${name.trim()}' ya está en uso.`);
             err.statusCode = 409; throw err;
        }
        if (!error.statusCode) error.statusCode = 500;
        throw error;
    }
};

const getAllRoles = async (includeInactive = false) => {
    try {
        const queryOptions = {
            include: [{
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            order: [['name', 'ASC']]
        };
        const scopeToUse = includeInactive ? Role.unscoped() : Role;
        const roles = await scopeToUse.findAll(queryOptions);
        return roles.map(transformRoleForOutput);
    } catch (error) {
        console.error("Error en roleService.getAllRoles:", error.parent?.sqlMessage || error.message);
        // Relanzar el error para que el controlador lo maneje con su mensaje genérico
        throw error; 
    }
};

const updateRole = async (roleId, roleData) => {
    const id = parseInt(roleId, 10);
    if (isNaN(id) || id <= 0) {
        const error = new Error("ID de rol inválido para actualizar."); error.statusCode = 400; throw error;
    }
    try {
        const role = await Role.unscoped().findByPk(id);
        if (!role) {
            const error = new Error('Rol no encontrado para actualizar.'); error.statusCode = 404; throw error;
        }

        const dataToUpdate = {};
        if (typeof roleData.name === 'string' && roleData.name.trim() !== role.name) {
           const newNameTrimmed = roleData.name.trim();
           const existingName = await Role.unscoped().findOne({ where: { name: newNameTrimmed, id: { [Op.ne]: id } } }); // Op.ne aquí
           if (existingName) {
               const err = new Error(`El nombre de rol '${newNameTrimmed}' ya está en uso.`); err.statusCode = 409; throw err;
           }
           dataToUpdate.name = newNameTrimmed;
        }

        if (Object.keys(dataToUpdate).length > 0) {
            console.log(`[SVC updateRole ID: ${id}] Actualizando datos del rol:`, dataToUpdate);
            await role.update(dataToUpdate);
        }

        if (roleData.hasOwnProperty('permissions')) {
            if (!Array.isArray(roleData.permissions)) {
                const error = new Error("El campo 'permissions' debe ser un array de nombres."); error.statusCode = 400; throw error;
            }
            const permissionIdsToAssociate = await getPermissionIdsFromNames(roleData.permissions);
            console.log(`[SVC updateRole ID: ${id}] Actualizando permisos a IDs:`, permissionIdsToAssociate);
            await role.setPermissions(permissionIdsToAssociate);
        }
        console.log(`[SVC updateRole ID: ${id}] Rol actualizado. Obteniendo rol completo...`);
        return getRoleById(id);
    } catch (error) {
        if (!error.statusCode) {
            console.error(`Error en roleService.updateRole (ID: ${id}):`, error.parent?.sqlMessage || error.message);
            error.statusCode = 500;
        }
        throw error;
    }
};

const deleteRole = async (id) => {
    const roleId = parseInt(id, 10);
     if (isNaN(roleId) || roleId <= 0) {
        const error = new Error("ID de rol inválido para eliminar."); error.statusCode = 400; throw error;
    }
    try {
        const role = await Role.unscoped().findByPk(roleId);
        if (!role) {
             const error = new Error('Rol no encontrado para eliminar'); error.statusCode = 404; throw error;
        }
        const userCount = await User.count({ where: { roleId: roleId } });
        if (userCount > 0) {
            const error = new Error(`No se puede eliminar el rol '${role.name}' porque tiene ${userCount} usuario(s) asociado(s). Considere desactivar el rol en su lugar.`);
            error.statusCode = 409; throw error;
        }
        await role.setPermissions([]);
        const result = await Role.unscoped().destroy({ where: { id: roleId } });
        if (result === 0) {
             console.warn(`deleteRole (ID: ${roleId}): Role.destroy devolvió 0.`);
        }
        return true;
    } catch (error) {
        if (!error.statusCode) {
             console.error(`Error en roleService.deleteRole (ID: ${id}):`, error.parent?.sqlMessage || error.message);
             error.statusCode = 500;
        }
        throw error;
    }
};

const toggleRoleStatus = async (id, newStatus) => {
    if (typeof newStatus !== 'boolean') {
         const error = new Error("El estado proporcionado debe ser true o false."); error.statusCode = 400; throw error;
    }
    const roleId = parseInt(id, 10);
    if (isNaN(roleId) || roleId <= 0) {
        const error = new Error("ID de rol inválido."); error.statusCode = 400; throw error;
    }
    try {
        const role = await Role.unscoped().findByPk(roleId);
        if (!role) {
            const error = new Error('Rol no encontrado para cambiar estado.'); error.statusCode = 404; throw error;
        }
        if (role.status === newStatus) {
            console.log(`[RoleService] Rol ${roleId} ya está en estado ${newStatus}.`);
            return getRoleById(roleId);
        }

        const [affectedRows] = await Role.unscoped().update({ status: newStatus }, { where: { id: roleId } });
        if (affectedRows === 0) {
             const error = new Error('No se pudo actualizar el estado del rol (0 filas afectadas).'); error.statusCode = 500; throw error;
        }
        console.log(`[RoleService] Rol ${roleId} status cambiado a ${newStatus}`);

        if (newStatus === false) {
            const usersToDeactivate = await User.findAll({ where: { roleId: roleId, status: true } });
            if (usersToDeactivate.length > 0) {
                console.log(`[RoleService] Desactivando ${usersToDeactivate.length} usuarios asociados al rol '${role.name}'...`);
                const userIdsToDeactivate = usersToDeactivate.map(u => u.id);
                await User.update({ status: false }, { where: { id: { [Op.in]: userIdsToDeactivate } }}); // Op.in aquí
                console.log(`[RoleService] ${usersToDeactivate.length} usuarios asociados fueron desactivados.`);
            }
        }
        return getRoleById(roleId);
    } catch (error) {
        if (!error.statusCode) {
            console.error(`Error en roleService.toggleRoleStatus (ID: ${id}):`, error.parent?.sqlMessage || error.message);
            error.statusCode = 500;
        }
        throw error;
    }
};

module.exports = {
  createRole, getAllRoles, getRoleById, updateRole, deleteRole, toggleRoleStatus
};