// src/controladores/AlimentacionController.js
const alimentacionService = require('../servicios/AlimentacionService');
const { validationResult } = require('express-validator');
// const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

const createAlimentacion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const nuevoRegistro = await alimentacionService.createAlimentacion(req.body);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error en controlador al crear alimentación:", error);
        // Manejar error UniqueConstraintError si existe el índice único compuesto
         if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(409).json({ message: 'Ya existe un registro de este alimento para este espécimen hoy (o según tu índice).' });
         }
        res.status(500).json({ message: 'Error al crear el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const getAllAlimentaciones = async (req, res) => {
    try {
        const alimentaciones = await alimentacionService.getAllAlimentaciones();
        res.status(200).json(alimentaciones);
    } catch (error) {
        console.error("Error en controlador al obtener alimentaciones:", error);
        res.status(500).json({ message: 'Error al obtener los registros de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const getAlimentacionById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        const registro = await alimentacionService.getAlimentacionById(id);

        if (!registro) {
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' });
        }
        res.status(200).json(registro);
    } catch (error) {
        console.error("Error en controlador al obtener alimentación por ID:", error);
        res.status(500).json({ message: 'Error al obtener el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const updateAlimentacion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        // El servicio devuelve la instancia actualizada
        const registroActualizado = await alimentacionService.updateAlimentacion(id, req.body);

        if (!registroActualizado) {
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' });
        }
        res.status(200).json(registroActualizado); // Devolver instancia actualizada
    } catch (error) {
        console.error("Error en controlador al actualizar alimentación:", error);
        // Manejar error UniqueConstraintError si existe el índice único compuesto
         if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(409).json({ message: 'La actualización crearía un registro duplicado (alimento/espécimen).' });
         }
        res.status(500).json({ message: 'Error al actualizar el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const deleteAlimentacion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        const fueEliminado = await alimentacionService.deleteAlimentacion(id); // Servicio devuelve true/false

        if (!fueEliminado) {
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error en controlador al eliminar alimentación:", error);
        res.status(500).json({ message: 'Error al eliminar el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

/**
 * Controlador para actualizar solo el estado de un registro de alimentación.
 */
const updateEstado = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { estado } = req.body;

    try {
        const [affectedRows] = await alimentacionService.updateAlimentacionEstado(id, estado);

        if (affectedRows === 0) {
             const exists = await alimentacionService.getAlimentacionById(id);
             if (!exists) {
                 return res.status(404).json({ message: 'Alimentacion record not found' });
             } else {
                 // Si existe pero no se afectaron filas, el estado ya era el mismo
                 return res.status(200).json({ message: `Alimentacion ${id} state was already ${estado}` });
             }
        }
        // Devolver registro actualizado
        const updatedRecord = await alimentacionService.getAlimentacionById(id);
        res.status(200).json(updatedRecord);

    } catch (error) {
        console.error(`Error updating state for alimentacion ${id}:`, error);
        res.status(500).json({ message: 'Error updating alimentacion state', error: 'Ocurrió un error interno.' });
    }
};

/**
 * Controlador para obtener registros de alimentación por ID de Espécimen.
 */
const getAlimentacionesBySpecimen = async (req, res) => {
    const errors = validationResult(req); // Validará el specimenId del param
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { specimenId } = req.params;
    try {
        const alimentaciones = await alimentacionService.getAlimentacionBySpecimenId(specimenId);
        // No es un error 404 si no hay registros, simplemente devuelve un array vacío.
        res.status(200).json(alimentaciones || []);
    } catch (error) {
        console.error(`Error getting alimentacion for specimen ${specimenId}:`, error);
        res.status(500).json({ message: 'Error fetching alimentacion records for specimen', error: 'Ocurrió un error interno.' });
    }
};


module.exports = {
    createAlimentacion,
    getAllAlimentaciones,
    getAlimentacionById,
    updateAlimentacion,
    deleteAlimentacion,
    updateEstado,
    getAlimentacionesBySpecimen
};
