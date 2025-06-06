// src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const { User, Role, Permission } = require('../modelos/associations.js');

const authenticate = (req, res, next) => {
    console.log(`[Auth Middleware] Ejecutando para: ${req.method} ${req.originalUrl}`);

    if (!secretKey) {
        console.error("[Auth Middleware] FATAL ERROR: JWT_SECRET no definida.");
        return res.status(500).json({ message: 'Internal server configuration error.' });
    }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Auth Middleware] Token no encontrado o formato incorrecto.');
        return res.status(401).json({ message: 'Authentication required (Token missing or bad format)' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[Auth Middleware] Intentando verificar token:', token);

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('[Auth Middleware] VERIFICACIÓN EXITOSA. Payload:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('[Auth Middleware] VERIFICACIÓN FALLIDA:', error.name, error.message);
        let message = 'Invalid token';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Malformed or invalid token signature';
        }
        return res.status(401).json({ message });
    }
};

const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        console.log(`[Auth Middleware - authorize] Verificando permiso requerido: '${requiredPermission}'`);

        if (!req.user) {
            console.warn('[Auth Middleware - authorize] Intento de autorización sin usuario autenticado (req.user no existe).');
            return res.status(401).json({ message: 'Autenticación requerida antes de verificar permisos.' });
        }

        const userId = req.user.userId || req.user.id;
        if (!userId) {
            console.error('[Auth Middleware - authorize] No se pudo obtener el ID del usuario desde req.user.');
            return res.status(403).json({ message: 'Acceso denegado: No se pudo identificar al usuario.' });
        }

        console.log(`[Auth Middleware - authorize] Buscando permisos para Usuario ID: ${userId}`);

        try {
            const user = await User.findByPk(userId, {
                include: {
                    model: Role,
                    as: 'role',
                    include: {
                        model: Permission,
                        as: 'permissions',
                        attributes: ['name'],
                        through: { attributes: [] }
                    }
                }
            });

            if (!user || !user.role) {
                console.warn(`[Auth Middleware - authorize] Usuario ID ${userId} no encontrado o sin rol asignado.`);
                return res.status(403).json({ message: 'Acceso denegado: Usuario o rol no encontrado.' });
            }

            const userPermissions = user.role.permissions?.map(p => p.name) || [];
            console.log(`[Auth Middleware - authorize] Permisos encontrados para rol '${user.role.name}':`, userPermissions);

            const hasPermission = userPermissions.includes(requiredPermission);

            if (hasPermission) {
                console.log(`[Auth Middleware - authorize] PERMISO CONCEDIDO: Usuario ${userId} tiene '${requiredPermission}'.`);
                next();
            } else {
                console.warn(`[Auth Middleware - authorize] PERMISO DENEGADO: Usuario ${userId} NO tiene '${requiredPermission}'. Rol: '${user.role.name}'.`);
                return res.status(403).json({ message: 'Acceso denegado: No tiene los permisos necesarios para realizar esta acción.' });
            }

        } catch (error) {
            console.error(`[Auth Middleware - authorize] Error al verificar permisos para usuario ID ${userId}:`, error);
            return res.status(500).json({ message: 'Error interno del servidor al verificar permisos.' });
        }
    };
};

module.exports = {
    authenticate,
    authorize
};
