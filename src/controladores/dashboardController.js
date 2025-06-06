// src/controladores/dashboardController.js
const dashboardService = require('../servicios/dashboardService');

const getTotalEjemplares = async (req, res) => {
    try {
        const data = await dashboardService.getTotalEjemplares();
        res.status(200).json(data);
    } catch (error) {
        console.error('[DashboardCtrl] Error en getTotalEjemplares:', error);
        res.status(500).json({ message: error.message || 'Error al obtener el total de ejemplares.' });
    }
};

const getContratosNuevosPorMes = async (req, res) => {
    try {
        const anio = req.query.anio || new Date().getFullYear(); // Usar año actual si no se especifica
        const data = await dashboardService.getContratosNuevosPorMes(parseInt(anio, 10));
        res.status(200).json(data);
    } catch (error) {
        console.error('[DashboardCtrl] Error en getContratosNuevosPorMes:', error);
        if (error.message.includes('Año inválido')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Error al obtener los datos de contratos mensuales.' });
    }
};

const getDistribucionEjemplaresPorSede = async (req, res) => {
    try {
        const data = await dashboardService.getDistribucionEjemplaresPorSede();
        res.status(200).json(data);
    } catch (error) {
        console.error('[DashboardCtrl] Error en getDistribucionEjemplaresPorSede:', error);
        res.status(500).json({ message: error.message || 'Error al obtener la distribución de ejemplares por sede.' });
    }
};

module.exports = {
    getTotalEjemplares,
    getContratosNuevosPorMes,
    getDistribucionEjemplaresPorSede
};