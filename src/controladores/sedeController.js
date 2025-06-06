// src/controladores/sedeController.js
const { validationResult } = require('express-validator');
const sedeService = require("../servicios/sedeService"); // Verifica la ruta

// Controlador para obtener todas las sedes
const getSedes = async (req, res) => {
    console.log('[SedeController] Iniciando getSedes...');
    try {
        console.log('[SedeController] Llamando a sedeService.listSedes...');
        const sedes = await sedeService.listSedes(); // Llama al servicio
        console.log('[SedeController] Sedes recibidas del servicio:', sedes); // Loguea lo que recibió

        // Intenta enviar la respuesta
        console.log('[SedeController] Intentando enviar respuesta JSON...');
        res.status(200).json(sedes);
        console.log('[SedeController] Respuesta JSON enviada exitosamente.'); // Si llega aquí, tuvo éxito

    } catch (error) {
        // Loguea el error específico capturado por el controlador
        console.error('[SedeController] Error capturado en getSedes:', error);
        // Envía la respuesta de error 500
        res.status(500).json({
             message: 'Error al obtener las sedes (controlador)', // Mensaje indicando origen
             // Incluye el mensaje del error original para más detalle
             error: error.message || 'Error desconocido'
        });
    }
};

// Controlador para agregar una nueva sede
const addSede = async (req, res) => {
    // ... (resto de controladores: addSede, getSedeById, updateSede, deleteSede) ...
    // Puedes añadir logs similares en ellos si también fallan
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log('[SedeController] Iniciando addSede...');
     try {
        const sede = await sedeService.addSede(req.body);
        console.log('[SedeController] Sede añadida:', sede);
        res.status(201).json(sede);
     } catch (error) {
        console.error('[SedeController] Error capturado en addSede:', error);
        res.status(400).json({ message: 'Error al añadir la sede', error: error.message });
     }
};

const getSedeById = async (req, res) => {
    console.log(`[SedeController] Iniciando getSedeById para ID: ${req.params.id}`);
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
     try {
        const sede = await sedeService.findSede(req.params.id);
         // El servicio ahora lanza error si no encuentra, así que el check !sede no es estrictamente necesario aquí
        // if (!sede) {
        //     return res.status(404).json({ message: 'Sede no encontrada' });
        // }
        console.log(`[SedeController] Sede encontrada por ID ${req.params.id}:`, sede);
        res.status(200).json(sede);
     } catch (error) {
        console.error(`[SedeController] Error capturado en getSedeById (ID: ${req.params.id}):`, error);
        // Distinguir si el error es "No encontrada" vs otro error
        if (error.message === 'Sede no encontrada') {
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: 'Error al obtener la sede', error: error.message });
        }
     }
};

const updateSede = async (req, res) => {
    console.log(`[SedeController] Iniciando updateSede para ID: ${req.params.id}`);
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
     try {
        // El servicio ahora lanza error si no se actualiza/encuentra
        const affectedRowsArray = await sedeService.modifySede(req.params.id, req.body);
        console.log(`[SedeController] updateSede afectó ${affectedRowsArray[0]} filas.`);
        // Ya no necesitamos chequear !sede[0] porque el servicio lanza error si es 0
        res.status(200).json({ message: 'Sede actualizada correctamente' }); // O status 204 sin contenido
     } catch (error) {
         console.error(`[SedeController] Error capturado en updateSede (ID: ${req.params.id}):`, error);
         // Distinguir "No encontrada" de otros errores
         if (error.message.includes('Sede no encontrada')) {
              res.status(404).json({ message: error.message });
         } else {
              res.status(400).json({ message: 'Error al actualizar la sede', error: error.message }); // 400 Bad Request es común para updates fallidos
         }
     }
};

const deleteSede = async (req, res) => {
    console.log(`[SedeController] Iniciando deleteSede para ID: ${req.params.id}`);
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
     try {
         // El servicio ahora lanza error si no se encuentra/elimina
        await sedeService.removeSede(req.params.id);
        console.log(`[SedeController] deleteSede exitoso para ID: ${req.params.id}`);
        res.status(200).json({ message: 'Sede eliminada' }); // O status 204 sin contenido
     } catch (error) {
         console.error(`[SedeController] Error capturado en deleteSede (ID: ${req.params.id}):`, error);
         if (error.message.includes('Sede no encontrada')) {
              res.status(404).json({ message: error.message });
         } else {
              res.status(500).json({ message: 'Error al eliminar la sede', error: error.message });
         }
     }
};

module.exports = {
    getSedes,
    addSede,
    getSedeById,
    updateSede,
    deleteSede
};