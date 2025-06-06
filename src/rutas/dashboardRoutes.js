// src/rutas/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controladores/dashboardController');
const { authenticate } = require('../middlewares/auth'); // Tu middleware de autenticación
const authorize = require('../middlewares/authorize');   // Tu middleware de autorización

// Ruta para obtener el total de ejemplares
router.get(
    '/total-ejemplares',
    authenticate,
    authorize('acceso_dashboard'), // Asegúrate de tener este permiso definido
    dashboardController.getTotalEjemplares
);

// Ruta para obtener contratos nuevos por mes (acepta query param ?anio=YYYY)
router.get(
    '/contratos-nuevos-mensuales',
    authenticate,
    authorize('acceso_dashboard'),
    dashboardController.getContratosNuevosPorMes
);

// Ruta para obtener la distribución de ejemplares por sede
router.get(
    '/distribucion-ejemplares-sede',
    authenticate,
    authorize('acceso_dashboard'),
    dashboardController.getDistribucionEjemplaresPorSede
);

module.exports = router;