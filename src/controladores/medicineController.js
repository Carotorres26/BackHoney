// src/controladores/medicineController.js
const medicineService = require('../servicios/medicineService');
const { validationResult } = require('express-validator');
const { UniqueConstraintError } = require('sequelize');

const createMedicine = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Asegúrate de que el servicio devuelva la instancia creada con el espécimen si lo necesitas
        const medicine = await medicineService.createMedicine(req.body);
        res.status(201).json(medicine);
    } catch (error) {
        console.error("Error creating medicine:", error);
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: 'Error al crear la medicina',
                error: 'Ya existe una medicina con este nombre para el espécimen especificado.',
            });
        }
        res.status(500).json({
             message: 'Error creating medicine',
             error: 'Ocurrió un error interno en el servidor.'
        });
    }
};

const getAllMedicines = async (req, res) => {
    try {
        const medicines = await medicineService.getAllMedicines();
        res.status(200).json(medicines);
    } catch (error) {
        console.error("Error getting all medicines:", error);
        res.status(500).json({ message: 'Error fetching medicines', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const getMedicineById = async (req, res) => {
     const errors = validationResult(req); // Validar ID del parámetro
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const medicine = await medicineService.getMedicineById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json(medicine);
    } catch (error) {
        console.error("Error getting medicine by ID:", error);
        res.status(500).json({ message: 'Error fetching medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const updateMedicine = async (req, res) => {
     const errors = validationResult(req); // Validar ID y body
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const medicineId = req.params.id;
        // El servicio ahora devuelve la instancia actualizada (o null)
        const medicine = await medicineService.updateMedicine(medicineId, req.body);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json(medicine); // Devolver la instancia actualizada
    } catch (error) {
        console.error("Error updating medicine:", error);
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: 'Error al actualizar la medicina',
                error: 'Ya existe otra medicina con este nombre para el espécimen especificado.',
            });
        }
        res.status(500).json({ message: 'Error updating medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const deleteMedicine = async (req, res) => {
    const errors = validationResult(req); // Validar ID
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const result = await medicineService.deleteMedicine(req.params.id);
        if (!result) { // El servicio ahora devuelve true/false
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({ message: 'Error deleting medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

/**
 * Controlador para actualizar solo el estado de una medicina.
 */
const updateEstado = async (req, res) => {
    const errors = validationResult(req); // Validará el ID del param y el estado del body
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { estado } = req.body; // El nuevo estado viene en el body

    try {
        const [affectedRows] = await medicineService.updateMedicineEstado(id, estado);

        if (affectedRows === 0) {
            // Podría ser no encontrado o que el estado ya era el mismo
            // Buscamos si existe para dar el mensaje correcto
            const exists = await medicineService.getMedicineById(id);
            if (!exists) {
                 return res.status(404).json({ message: 'Medicine not found' });
            } else {
                 // Si existe pero no se afectaron filas, el estado ya era el mismo
                 // Devolvemos 200 OK pero indicando que no hubo cambios
                 return res.status(200).json({ message: `Medicine ${id} state was already ${estado}` });
                 // O un 304 Not Modified si prefieres, aunque 200 es común aquí
                 // return res.status(304).send();
            }
        }

        // Si affectedRows > 0, la actualización fue exitosa
        // Podemos devolver la medicina actualizada si queremos
        const updatedMedicine = await medicineService.getMedicineById(id);
        res.status(200).json(updatedMedicine); // Devolver objeto completo actualizado

    } catch (error) {
        console.error(`Error updating state for medicine ${id}:`, error);
        res.status(500).json({ message: 'Error updating medicine state', error: 'Ocurrió un error interno.' });
    }
};

/**
 * Controlador para obtener registros de alimentación por ID de Espécimen.
 */
const getMedicinesBySpecimen = async (req, res) => {
    const errors = validationResult(req); // Validará el specimenId del param
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { specimenId } = req.params;
    try {
        const medicines = await medicineService.getMedicineBySpecimenId(specimenId);
        // No es un error 404 si no hay registros, simplemente devuelve un array vacío.
        res.status(200).json(medicines || []);
    } catch (error) {
        console.error(`Error getting medicina for specimen ${specimenId}:`, error);
        res.status(500).json({ message: 'Error fetching medicina records for specimen', error: 'Ocurrió un error interno.' });
    }
};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    updateEstado,
    getMedicinesBySpecimen
};