// src/controladores/VacunacionController.js
const vacunacionService = require('../servicios/VacunacionService');
const { validationResult } = require('express-validator');
// const { ForeignKeyConstraintError } = require('sequelize'); // Opcional para manejo específico

// --- Controlador para CREAR un registro de Vacunación ---
const createVacunacion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const nuevoRegistro = await vacunacionService.createVacunacion(req.body);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error en controlador al crear vacunación:", error);
        // Podrías verificar si el error es porque el specimenId no existe
        // if (error instanceof ForeignKeyConstraintError && error.message.includes('specimenId')) {
        //     return res.status(400).json({ message: 'Error al crear vacunación', error: 'El Espécimen especificado no existe.' });
        // }
        res.status(500).json({ message: 'Error al crear el registro de vacunación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para OBTENER TODOS los registros de Vacunación ---
const getAllVacunaciones = async (req, res) => {
    try {
        const vacunaciones = await vacunacionService.getAllVacunaciones();
        res.status(200).json(vacunaciones);
    } catch (error) {
        console.error("Error en controlador al obtener vacunaciones:", error);
        res.status(500).json({ message: 'Error al obtener los registros de vacunación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para OBTENER UN registro de Vacunación por ID ---
const getVacunacionById = async (req, res) => {
    const errors = validationResult(req); // Validará el ID del middleware
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        const registro = await vacunacionService.getVacunacionById(id);

        if (!registro) {
            return res.status(404).json({ message: 'Registro de vacunación no encontrado' });
        }
        res.status(200).json(registro);
    } catch (error) {
        console.error("Error en controlador al obtener vacunación por ID:", error);
        res.status(500).json({ message: 'Error al obtener el registro de vacunación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para ACTUALIZAR un registro de Vacunación por ID ---
const updateVacunacion = async (req, res) => {
    const errors = validationResult(req); // Validará ID y body
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        const registroActualizado = await vacunacionService.updateVacunacion(id, req.body);

        if (!registroActualizado) {
            return res.status(404).json({ message: 'Registro de vacunación no encontrado' });
        }
        res.status(200).json(registroActualizado);
    } catch (error) {
        console.error("Error en controlador al actualizar vacunación:", error);
        // Manejo opcional de ForeignKeyConstraintError si cambias specimenId
        res.status(500).json({ message: 'Error al actualizar el registro de vacunación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para ELIMINAR un registro de Vacunación por ID ---
const deleteVacunacion = async (req, res) => {
    const errors = validationResult(req); // Validará el ID
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        const fueEliminado = await vacunacionService.deleteVacunacion(id);

        if (!fueEliminado) {
            return res.status(404).json({ message: 'Registro de vacunación no encontrado' });
        }
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Error en controlador al eliminar vacunación:", error);
        res.status(500).json({ message: 'Error al eliminar el registro de vacunación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

/**
 * Controlador para obtener registros de alimentación por ID de Espécimen.
 */
const getVacunacionesBySpecimen = async (req, res) => {
    const errors = validationResult(req); // Validará el specimenId del param
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { specimenId } = req.params;
    try {
        const vacunaciones = await vacunacionService.getVacunacionBySpecimenId(specimenId);
        // No es un error 404 si no hay registros, simplemente devuelve un array vacío.
        res.status(200).json(vacunaciones || []);
    } catch (error) {
        console.error(`Error getting vacunacion for specimen ${specimenId}:`, error);
        res.status(500).json({ message: 'Error fetching vacunacion records for specimen', error: 'Ocurrió un error interno.' });
    }
};

module.exports = {
    createVacunacion,
    getAllVacunaciones,
    getVacunacionById,
    updateVacunacion,
    deleteVacunacion,
    getVacunacionesBySpecimen
};