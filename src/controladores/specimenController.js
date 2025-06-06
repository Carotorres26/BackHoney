// src/controladores/specimenController.js
const { validationResult } = require('express-validator');
const specimenService = require('../servicios/specimenService'); // Ajusta la ruta

// --- createSpecimen, getSpecimenById, updateSpecimen, deleteSpecimen, moveSpecimen (SIN CAMBIOS, usa tu versión existente) ---
// Si me los pasaste antes, ya deberían estar bien.

const createSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimen = await specimenService.createSpecimen(req.body);
    res.status(201).json(specimen);
  } catch (error) {
    console.error("[CTRL createSpecimen] Error:", error.message);
    const statusCode = error.statusCode || (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' ? 400 : 500);
    res.status(statusCode).json({ message: error.message || "Error al crear el ejemplar." });
  }
};


const getAllSpecimens = async (req, res) => {
  try {
    // Extraer todos los posibles filtros del query string
    const { sedeId, clientId, availableForContract, categoryId, name, specimenIdSpecific } = req.query;

    const filters = {};
    if (sedeId) filters.sedeId = sedeId;
    if (clientId) filters.clientId = clientId;
    if (categoryId) filters.categoryId = categoryId;
    if (name) filters.name = name;
    if (specimenIdSpecific) filters.id = specimenIdSpecific; // Para buscar un ejemplar específico por ID

    if (availableForContract !== undefined) {
        filters.availableForContract = availableForContract === 'true' || availableForContract === true;
    }

    console.log(`[CTRL getAllSpecimens] Filtros para el servicio:`, filters); // Log importante
    const specimens = await specimenService.getAllSpecimens(filters);
    res.status(200).json(specimens);
  } catch (error) {
    console.error("[CTRL getAllSpecimens] Error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Error al obtener ejemplares." });
  }
};

const getSpecimenById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimen = await specimenService.getSpecimenById(req.params.id);
    res.status(200).json(specimen); // El servicio debe lanzar error si no lo encuentra
  } catch (error) {
    console.error(`[CTRL getSpecimenById] Error ID ${req.params.id}:`, error.message);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedSpecimen = await specimenService.updateSpecimen(req.params.id, req.body);
    res.status(200).json(updatedSpecimen);
  } catch (error) {
    console.error(`[CTRL updateSpecimen] Error ID ${req.params.id}:`, error.message);
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const deleteSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specimenService.deleteSpecimen(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(`[CTRL deleteSpecimen] Error ID ${req.params.id}:`, error.message);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const moveSpecimen = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { sedeId, specimenCategoryId } = req.body;
        const { id } = req.params;
        const updatedSpecimen = await specimenService.moveSpecimen(id, sedeId, specimenCategoryId);
        res.status(200).json(updatedSpecimen);
    } catch (error) {
        console.error(`[CTRL moveSpecimen] Error ID ${req.params.id}:`, error.message);
        res.status(error.statusCode || 400).json({ message: error.message });
    }
};

module.exports = {
  createSpecimen,
  getAllSpecimens,
  getSpecimenById,
  updateSpecimen,
  deleteSpecimen,
  moveSpecimen
};