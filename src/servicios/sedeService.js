// src/servicios/sedeService.js

const Sede = require('../modelos/sede'); // Importa modelo por si se necesita
const sedeRepository = require('../repositorios/sedeRepository.js'); // Asegúrate que la RUTA es correcta

// Log para verificar la carga inicial del repositorio
console.log('[SedeService] Contenido de sedeRepository al cargar:', typeof sedeRepository, sedeRepository ? Object.keys(sedeRepository) : 'No cargado');
if (typeof sedeRepository?.getAllSedes !== 'function') {
     // Si esto aparece, hay un problema serio de carga (posible dependencia circular)
     console.error('[SedeService] ¡ALERTA CRÍTICA! La función getAllSedes NO está disponible en sedeRepository en el momento de la carga inicial del módulo.');
}

/**
 * Obtiene una lista de todas las Sedes.
 * @returns {Promise<Array<Model>>} Un array con todas las instancias de Sede.
 * @throws {Error} Si ocurre un error al interactuar con el repositorio.
 */
const listSedes = async () => {
    console.log('[SedeService] Iniciando listSedes...');
    try {
        // El nombre de la función en el repositorio ES 'getAllSedes'
        const functionNameToCall = 'getAllSedes';

        // Doble verificación justo antes de llamar (por si acaso)
        if (typeof sedeRepository?.[functionNameToCall] !== 'function') {
            console.error(`[SedeService] Error en tiempo de ejecución: sedeRepository.${functionNameToCall} NO es una función.`);
            throw new Error(`Función interna '${functionNameToCall}' no disponible para obtener sedes.`);
        }

        console.log(`[SedeService] Llamando a sedeRepository.${functionNameToCall}()...`);
        const sedes = await sedeRepository[functionNameToCall](); // Llama a la función usando el nombre correcto
        console.log(`[SedeService] Sedes obtenidas del repositorio (${sedes?.length || 0} encontradas).`);
        return sedes;

    } catch (error) {
        console.error("[SedeService] Error en listSedes al llamar al repositorio:", error);
        // Si el error viene del repo, incluir su mensaje puede ser útil
        throw new Error(`Error al obtener las sedes desde el repositorio: ${error.message || error}`);
    }
};

/**
 * Busca una Sede específica por su ID.
 * @param {number|string} id - El ID de la Sede a buscar.
 * @returns {Promise<Model>} La instancia de Sede encontrada.
 * @throws {Error} Si la Sede no se encuentra o si ocurre un error.
 */
const findSede = async (id) => {
    console.log(`[SedeService] Iniciando findSede para ID: ${id}`);
    const functionName = 'getSedeById'; // Asumiendo este nombre del repo es correcto
    try {
        if (typeof sedeRepository?.[functionName] !== 'function') {
             throw new Error(`Función interna '${functionName}' no disponible.`);
        }
        const sede = await sedeRepository[functionName](id);
        if (!sede) {
            console.log(`[SedeService] Sede con ID ${id} no encontrada.`);
            throw new Error('Sede no encontrada');
        }
        console.log(`[SedeService] Sede encontrada para ID: ${id}`);
        return sede;
    } catch (error) {
        console.error(`[SedeService] Error en findSede (ID: ${id}):`, error);
        throw new Error(`Error al obtener la sede: ${error.message}`);
    }
};

/**
 * Agrega una nueva Sede a la base de datos.
 * @param {object} sedeData - Los datos para la nueva Sede.
 * @returns {Promise<Model>} La instancia de la Sede creada.
 * @throws {Error} Si ocurre un error durante la creación.
 */
const addSede = async (sedeData) => {
    console.log('[SedeService] Iniciando addSede con datos:', sedeData);
    const functionName = 'createSede'; // Asumiendo este nombre del repo es correcto
    try {
         if (typeof sedeRepository?.[functionName] !== 'function') {
             throw new Error(`Función interna '${functionName}' no disponible.`);
        }
        const nuevaSede = await sedeRepository[functionName](sedeData);
        console.log(`[SedeService] Sede creada con ID: ${nuevaSede.id}`);
        return nuevaSede;
    } catch (error) {
        console.error("[SedeService] Error en addSede:", error);
        throw new Error(`Error al agregar la sede: ${error.message}`);
    }
};

/**
 * Modifica una Sede existente.
 * @param {number|string} id - El ID de la Sede a modificar.
 * @param {object} sedeData - Los nuevos datos para la Sede.
 * @returns {Promise<Array<number>>} Un array indicando el número de filas afectadas.
 * @throws {Error} Si la Sede no se encuentra o si ocurre un error.
 */
const modifySede = async (id, sedeData) => {
    console.log(`[SedeService] Iniciando modifySede para ID: ${id} con datos:`, sedeData);
    const functionName = 'updateSede'; // Asumiendo este nombre del repo es correcto
    try {
        if (typeof sedeRepository?.[functionName] !== 'function') {
             throw new Error(`Función interna '${functionName}' no disponible.`);
        }
        const affectedRowsArray = await sedeRepository[functionName](id, sedeData);
        if (!affectedRowsArray || affectedRowsArray[0] === 0) {
            console.log(`[SedeService] modifySede: Sede con ID ${id} no encontrada o datos sin cambios.`);
            throw new Error('Sede no encontrada para actualizar o los datos no cambiaron');
        }
        console.log(`[SedeService] Sede con ID ${id} actualizada. Filas afectadas: ${affectedRowsArray[0]}`);
        return affectedRowsArray;
    } catch (error) {
        console.error(`[SedeService] Error en modifySede (ID: ${id}):`, error);
        throw new Error(`Error al actualizar la sede: ${error.message}`);
    }
};

/**
 * Elimina una Sede de la base de datos.
 * @param {number|string} id - El ID de la Sede a eliminar.
 * @returns {Promise<object>} Un objeto indicando el éxito de la operación.
 * @throws {Error} Si la Sede no se encuentra o si ocurre un error.
 */
const removeSede = async (id) => {
    console.log(`[SedeService] Iniciando removeSede para ID: ${id}`);
    const functionName = 'deleteSede'; // Asumiendo este nombre del repo es correcto
    try {
        if (typeof sedeRepository?.[functionName] !== 'function') {
             throw new Error(`Función interna '${functionName}' no disponible.`);
        }
        const deletedRows = await sedeRepository[functionName](id);
        if (deletedRows === 0) {
             console.log(`[SedeService] removeSede: Sede con ID ${id} no encontrada para eliminar.`);
            throw new Error('Sede no encontrada para eliminar');
        }
        console.log(`[SedeService] Sede con ID ${id} eliminada.`);
        return { message: 'Sede eliminada correctamente' };
    } catch (error) {
        console.error(`[SedeService] Error en removeSede (ID: ${id}):`, error);
        throw new Error(`Error al eliminar la sede: ${error.message}`);
    }
};

// Exporta todas las funciones del servicio
module.exports = {
    listSedes,
    findSede,
    addSede,
    modifySede,
    removeSede
};