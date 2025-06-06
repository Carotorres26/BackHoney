// src/middlewares/authorize.js

// 1. Importar los modelos necesarios desde tu archivo de asociaciones
//    (Asegúrate que la ruta '../modelos/associations' sea correcta desde src/middlewares/)
const { Role, Permission } = require('../modelos/associations');

/**
 * Middleware factory (creador de middlewares) para verificar si el rol del usuario autenticado
 * tiene el permiso específico requerido para acceder a una ruta.
 *
 * Asume que un middleware de autenticación (como uno que verifica JWT) ya se ejecutó
 * y adjuntó la información del usuario (incluyendo `roleId` y `userId`) a `req.user`.
 *
 * @param {string} requiredPermission - El nombre exacto (string) del permiso requerido (ej: 'acceso_usuarios', 'crear_cliente').
 * @returns {function} Una función middleware de Express lista para usar en las rutas.
 */
const authorize = (requiredPermission) => {
    // Esta es la función middleware que Express ejecutará
    return async (req, res, next) => {
        const logPrefix = '[Authorize]'; // Prefijo para logs consistentes

        try {
            // 2. Obtener el roleId y userId del objeto `req.user` (puesto por el middleware de autenticación)
            const roleId = req.user?.roleId;
            const userId = req.user?.userId; // Útil para logging

            // 3. Verificación básica: ¿Existe roleId en la solicitud?
            if (typeof roleId === 'undefined' || roleId === null) {
                console.warn(`${logPrefix} No se encontró roleId en req.user. Asegúrate de que el middleware de autenticación (verifyToken o similar) se ejecute ANTES que este middleware authorize.`);
                return res.status(403).json({ message: 'Acceso denegado: Rol de usuario no identificado.' });
            }

            console.log(`${logPrefix} Verificando permiso: '${requiredPermission}' para usuario ID: ${userId}, Rol ID: ${roleId}`);

            // 4. Buscar el Rol por su ID (Primary Key) e incluir (include) sus Permisos asociados
            console.log(`${logPrefix} Buscando Rol con ID: ${roleId}`);
            const role = await Role.findByPk(roleId, {
                include: [{
                    model: Permission,
                    // El alias aquí DEBE coincidir EXACTAMENTE (mayúsculas/minúsculas)
                    // con el alias definido en `associations.js` ('permissions').
                    as: 'permissions', // Alias correcto (minúsculas)
                }],
            });

            // 5. Verificar si se encontró el Rol en la base de datos
            if (!role) {
                console.warn(`${logPrefix} Rol con ID ${roleId} (obtenido del token/req.user) no fue encontrado en la base de datos.`);
                return res.status(403).json({ message: 'Acceso denegado: Rol de usuario no válido o no encontrado.' });
            }

            // 6. Verificar si el Rol encontrado tiene el Permiso requerido.
            //    Los permisos cargados están ahora disponibles bajo la propiedad `role.permissions` (el alias).
            const userPermissions = role.permissions || [];
            const hasPermission = userPermissions.some(permission => permission.name === requiredPermission);

            // 7. Si el Rol NO tiene el permiso específico, denegar el acceso.
            if (!hasPermission) {
                const foundPermissionNames = userPermissions.map(p => p.name).join(', ') || 'ninguno';
                console.warn(`${logPrefix} Permiso '${requiredPermission}' DENEGADO para Rol ID: ${roleId} (${role.name || 'Sin Nombre'}). Permisos encontrados: [${foundPermissionNames}]`);
                return res.status(403).json({ message: 'Acceso denegado: No tiene los permisos necesarios para realizar esta acción.' });
            }

            // 8. Si el Rol SÍ tiene el permiso, permitir que la solicitud continúe.
            console.log(`${logPrefix} Permiso '${requiredPermission}' CONCEDIDO para Rol ID: ${roleId} (${role.name || 'Sin Nombre'})`);
            next(); // Llama al siguiente middleware o al manejador de la ruta final.

        } catch (error) {
            // 9. Capturar cualquier error inesperado durante el proceso de autorización.
            console.error(`${logPrefix} Error inesperado durante la autorización para el permiso '${requiredPermission}':`, error);
            res.status(500).json({ message: 'Error interno del servidor al verificar permisos.' });
        }
    };
};

// 10. Exportar la función factory DIRECTAMENTE.
// ESTA LÍNEA ES CORRECTA. El problema está en cómo se IMPORTA en roleRoutes.js
module.exports = authorize;