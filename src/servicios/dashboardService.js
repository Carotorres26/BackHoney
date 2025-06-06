// src/servicios/dashboardService.js
const { Specimen, Contract, Sede, sequelize } = require('../modelos/associations');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Obtiene el número total de ejemplares.
 */
const getTotalEjemplares = async () => {
    try {
        const total = await Specimen.count();
        return { totalEjemplares: total };
    } catch (error) {
        console.error('[DashboardService] Error obteniendo total de ejemplares:', error);
        throw new Error('Error al obtener el total de ejemplares.');
    }
};

/**
 * Obtiene el número de contratos nuevos creados por mes para un año específico.
 * @param {number} anio - El año para el cual se quieren los datos.
 */
const getContratosNuevosPorMes = async (anio) => {
    try {
        // Validar que el año sea un número
        const anioNumerico = parseInt(anio, 10);
        if (isNaN(anioNumerico)) {
            throw new Error('Año inválido proporcionado.');
        }

        const contratosPorMes = await Contract.findAll({
            attributes: [
                [fn('YEAR', col('createdAt')), 'anio'],
                [fn('MONTH', col('createdAt')), 'mes'],
                [fn('COUNT', col('id')), 'cantidadNuevos']
            ],
            where: {
                [Op.and]: [
                    sequelize.where(fn('YEAR', col('createdAt')), anioNumerico)
                ]
            },
            group: [fn('YEAR', col('createdAt')), fn('MONTH', col('createdAt'))],
            order: [[fn('MONTH', col('createdAt')), 'ASC']],
            raw: true // Para obtener resultados planos
        });

        // Formatear para que sea más fácil de usar en el frontend
        // Crear un array con 12 meses, inicializados en 0
        const resultadoFormateado = Array(12).fill(null).map((_, i) => ({
            mes: i + 1, // Mes de 1 a 12
            nombreMes: new Date(anioNumerico, i, 1).toLocaleString('es-ES', { month: 'long' }), // Nombre del mes
            cantidadNuevos: 0,
        }));

        contratosPorMes.forEach(item => {
            const mesIndex = item.mes - 1; // Los meses de SQL son 1-12, los índices de array 0-11
            if (resultadoFormateado[mesIndex]) {
                resultadoFormateado[mesIndex].cantidadNuevos = parseInt(item.cantidadNuevos, 10);
            }
        });

        return resultadoFormateado;

    } catch (error) {
        console.error('[DashboardService] Error obteniendo contratos nuevos por mes:', error);
        throw new Error('Error al obtener los datos de contratos mensuales.');
    }
};


/**
 * Obtiene la distribución actual de ejemplares por sede.
 * (Cuántos ejemplares hay en cada Sede)
 */
const getDistribucionEjemplaresPorSede = async () => {
    try {
        const distribucion = await Specimen.findAll({
            attributes: [
                'sedeId',
                [fn('COUNT', col('Specimen.id')), 'cantidadEjemplares'] // Asegúrate de calificar 'id' si hay ambigüedad
            ],
            include: [{
                model: Sede,
                as: 'sede',
                attributes: ['NombreSede'] // Solo necesitamos el nombre de la sede
            }],
            group: ['sedeId', 'sede.id', 'sede.NombreSede'], // Agrupar por sedeId y los atributos de Sede incluidos
            raw: true, // Devuelve objetos planos
            nest: true // Para anidar el objeto 'sede' correctamente
        });

        // Formatear para el frontend si es necesario
        return distribucion.map(item => ({
            nombreSede: item.sede ? item.sede.NombreSede : 'Sin Sede Asignada',
            cantidadEjemplares: parseInt(item.cantidadEjemplares, 10)
        }));

    } catch (error) {
        console.error('[DashboardService] Error obteniendo distribución de ejemplares por sede:', error);
        if (error.original) console.error("Error original de DB:", error.original);
        throw new Error('Error al obtener la distribución de ejemplares por sede.');
    }
};


module.exports = {
    getTotalEjemplares,
    getContratosNuevosPorMes,
    getDistribucionEjemplaresPorSede
};