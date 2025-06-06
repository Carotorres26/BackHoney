// src/repositorios/sedeRepository.js

// Importa los modelos necesarios. Asegúrate que las rutas sean correctas.
const Sede = require('../modelos/sede');
const Specimen = require('../modelos/Specimen');

console.log('[SedeRepo] Módulo cargado.'); // Log para saber que el archivo se carga

/**
 * Crea una nueva Sede.
 * @param {object} sedeData - Datos para la nueva sede.
 * @returns {Promise<Model>} La instancia de la Sede creada.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const createSede = async (sedeData) => {
    console.log('[SedeRepo] Ejecutando createSede con datos:', sedeData);
    try {
        const nuevaSede = await Sede.create(sedeData);
        console.log('[SedeRepo] createSede exitoso. ID:', nuevaSede.id);
        return nuevaSede;
    } catch (error) {
        console.error('[SedeRepo] Error en createSede:', error);
        throw error; // Relanza el error para que el servicio lo maneje
    }
};

/**
 * Obtiene todas las Sedes.
 * NOTA: Se ha quitado la inclusión de 'ejemplaresEnSede' aquí para prevenir
 * posibles errores de serialización JSON por referencias circulares en listas grandes.
 * @returns {Promise<Array<Model>>} Un array con todas las instancias de Sede.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const getAllSedes = async () => {
    console.log('[SedeRepo] Ejecutando getAllSedes...');
    try {
        // --- MODIFICACIÓN REALIZADA AQUÍ ---
        const sedes = await Sede.findAll({
            // Se quita o comenta el bloque include para esta función específica
            // include: [{
            //     model: Specimen,
            //     as: 'ejemplaresEnSede'
            // }],
            order: [['id', 'ASC']] // Opcional: Ordenar resultados
        });
        // ------------------------------------
        console.log(`[SedeRepo] getAllSedes encontró ${sedes.length} sedes (sin incluir ejemplares).`);
        return sedes;
    } catch (error) {
        console.error('[SedeRepo] Error en getAllSedes:', error);
        throw error;
    }
};

/**
 * Obtiene una Sede específica por su ID, incluyendo ejemplares.
 * @param {number|string} id - El ID de la Sede a buscar.
 * @returns {Promise<Model|null>} La instancia de Sede o null si no se encuentra.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const getSedeById = async (id) => {
    console.log(`[SedeRepo] Ejecutando getSedeById para ID: ${id}`);
    try {
        // Mantenemos el include aquí, ya que es para una sola sede y menos propenso a problemas
        const sede = await Sede.findByPk(id, {
            include: [{
                model: Specimen,
                as: 'ejemplaresEnSede' // Asegúrate que este alias coincida con tu definición en index.js
                // attributes: ['id', 'name'] // Podrías limitar atributos aquí si quieres
            }]
        });
        if (sede) {
            console.log(`[SedeRepo] getSedeById encontró sede para ID: ${id}`);
        } else {
            console.log(`[SedeRepo] getSedeById NO encontró sede para ID: ${id}`);
        }
        return sede; // Devuelve la sede encontrada o null
    } catch (error) {
        console.error(`[SedeRepo] Error en getSedeById (ID: ${id}):`, error);
        throw error;
    }
};

/**
 * Actualiza una Sede existente.
 * @param {number|string} id - El ID de la Sede a actualizar.
 * @param {object} sedeData - Los datos a actualizar.
 * @returns {Promise<Array<number>>} Un array con el número de filas afectadas (ej: [1] o [0]).
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const updateSede = async (id, sedeData) => {
    console.log(`[SedeRepo] Ejecutando updateSede para ID: ${id} con datos:`, sedeData);
    try {
        // Asegurarse que el ID es un número
        const sedeId = parseInt(id, 10);
        if (isNaN(sedeId)) {
            throw new Error(`ID de sede inválido para actualizar: ${id}`);
        }
        // Filtrar datos indefinidos o el propio id si viene en sedeData
        const dataToUpdate = {};
         Object.keys(sedeData).forEach(key => {
            if (sedeData[key] !== undefined && key !== 'id') {
                 dataToUpdate[key] = sedeData[key];
            }
        });
         if (Object.keys(dataToUpdate).length === 0) {
            console.log(`[SedeRepo] updateSede ID ${id}: No hay datos válidos para actualizar.`);
            return [0];
         }

        const resultado = await Sede.update(dataToUpdate, {
            where: { id: sedeId }
        });
        console.log(`[SedeRepo] updateSede para ID ${sedeId}. Filas afectadas: ${resultado[0]}`);
        return resultado; // Devuelve [numberOfAffectedRows]
    } catch (error) {
        console.error(`[SedeRepo] Error en updateSede (ID: ${id}):`, error);
        throw error;
    }
};

/**
 * Elimina una Sede por su ID.
 * @param {number|string} id - El ID de la Sede a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (0 o 1).
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const deleteSede = async (id) => {
    console.log(`[SedeRepo] Ejecutando deleteSede para ID: ${id}`);
    try {
        const sedeId = parseInt(id, 10);
         if (isNaN(sedeId)) {
            throw new Error(`ID de sede inválido para eliminar: ${id}`);
        }
        const numeroFilasEliminadas = await Sede.destroy({
            where: { id: sedeId }
        });
        console.log(`[SedeRepo] deleteSede para ID ${sedeId}. Filas eliminadas: ${numeroFilasEliminadas}`);
        return numeroFilasEliminadas; // Devuelve el número de filas eliminadas
    } catch (error) {
        console.error(`[SedeRepo] Error en deleteSede (ID: ${id}):`, error);
        throw error;
    }
};

/**
 * Verifica si una Sede existe por su nombre.
 * @param {string} NombreSede - El nombre de la Sede a buscar.
 * @returns {Promise<Model|null>} La instancia de Sede encontrada o null.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const sedeExists = async (NombreSede) => {
    console.log(`[SedeRepo] Ejecutando sedeExists para NombreSede: ${NombreSede}`);
    try {
        // Asegurarse de que el nombre no sea undefined o null antes de buscar
        if (!NombreSede) {
             console.warn('[SedeRepo] sedeExists llamado con nombre nulo o indefinido.');
             return null;
        }
        const sede = await Sede.findOne({ where: { NombreSede: NombreSede } });
        console.log(`[SedeRepo] sedeExists encontró para '${NombreSede}':`, !!sede);
        return sede;
    } catch (error) {
        console.error(`[SedeRepo] Error en sedeExists (NombreSede: ${NombreSede}):`, error);
        throw error;
    }
};

/**
 * Verifica si una Sede existe por su ID.
 * @param {number|string} id - El ID de la Sede a buscar.
 * @returns {Promise<Model|null>} La instancia de Sede encontrada o null.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const sedeExistsById = async (id) => {
    console.log(`[SedeRepo] Ejecutando sedeExistsById para ID: ${id}`);
    try {
        const sedeId = parseInt(id, 10);
        if (isNaN(sedeId)) {
             console.warn(`[SedeRepo] sedeExistsById llamado con ID inválido: ${id}`);
             return null;
        }
        const sede = await Sede.findByPk(sedeId);
        console.log(`[SedeRepo] sedeExistsById encontró para ID ${sedeId}:`, !!sede);
        return sede;
    } catch (error) {
        console.error(`[SedeRepo] Error en sedeExistsById (ID: ${id}):`, error);
        throw error;
    }
};

// Exporta todas las funciones definidas
module.exports = {
    createSede,
    getAllSedes, // Modificada para no incluir ejemplares por defecto
    getSedeById,
    updateSede,
    deleteSede,
    sedeExists,
    sedeExistsById
};