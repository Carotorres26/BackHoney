// src/controladores/specimenCategoryController.js
const { validationResult } = require('express-validator');
const specimenCategoryService = require('../servicios/specimenCategoryService');

const createSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, estado } = req.body; // Puede recibir 'name' y opcionalmente 'estado'
    const dataToCreate = { name };
    if (estado !== undefined && (estado === 'activo' || estado === 'inactivo')) { // Validar estado si se envía
        dataToCreate.estado = estado;
    }
    const specimenCategory = await specimenCategoryService.createSpecimenCategory(dataToCreate);
    res.status(201).json(specimenCategory);
  } catch (error) {
    console.error("Error Controller (createSpecimenCategory):", error);
    res.status(error.statusCode || 400).json({ message: error.message || "Error al crear la categoría." });
  }
};

const getAllSpecimenCategories = async (req, res) => {
  try {
     const includeInactive = req.query.includeInactive === 'true';
    const specimenCategories = await specimenCategoryService.getAllSpecimenCategories(includeInactive);
    res.status(200).json(specimenCategories);
  } catch (error) {
    console.error("Error Controller (getAllSpecimenCategories):", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Error al obtener las categorías." });
  }
};

const getSpecimenCategoryById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const specimenCategory = await specimenCategoryService.getSpecimenCategoryById(req.params.id);
    res.status(200).json(specimenCategory);
  } catch (error) {
    console.error(`Error Controller (getSpecimenCategoryById ${req.params.id}):`, error);
    res.status(error.statusCode || 500).json({ message: error.message || "Error al obtener la categoría por ID." });
  }
};

// Este controlador es para la ruta PUT /:id y SOLO actualiza el nombre
const updateSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body; // Solo se espera 'name'
    const dataToUpdate = {};

    if (name !== undefined) { // Si 'name' viene en el body
        dataToUpdate.name = name;
    } else { // Si 'name' no viene, no hay nada que actualizar por esta ruta
        return res.status(400).json({ message: "No se proporcionó el campo 'name' para actualizar." });
    }

    const updatedCategory = await specimenCategoryService.updateSpecimenCategoryName(req.params.id, dataToUpdate.name); // Asume un servicio que solo actualiza el nombre
    res.status(200).json(updatedCategory);

  } catch (error) {
    console.error(`Error Controller (updateSpecimenCategory ${req.params.id}):`, error);
    res.status(error.statusCode || 400).json({ message: error.message || "Error al actualizar la categoría." });
  }
};

// --- NUEVO CONTROLADOR PARA ACTUALIZAR ESTADO ---
const updateSpecimenCategoryStatus = async (req, res) => {
    // Las validaciones de 'id' (param) y 'estado' (body) ya las hizo el middleware
    // y handleValidationErrors (en rutas) ya verificó validationResult.
    const { id } = req.params;
    const { estado } = req.body; // Solo se espera 'estado'

    try {
        const updatedCategory = await specimenCategoryService.updateSpecimenCategoryStatus(id, estado);
        // El servicio specimenCategoryService.updateSpecimenCategoryStatus debe lanzar error si no encuentra la categoría
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error(`Error Controller (updateSpecimenCategoryStatus ${id}):`, error);
        // El servicio debería haber manejado el 'not found' con un error que tenga statusCode
        res.status(error.statusCode || 500).json({ message: error.message || "Error al actualizar el estado de la categoría." });
    }
};
// --- FIN NUEVO CONTROLADOR ---

const deleteSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await specimenCategoryService.deleteSpecimenCategory(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(`Error Controller (deleteSpecimenCategory ${req.params.id}):`, error);
    res.status(error.statusCode || 500).json({ message: error.message || "Error al eliminar la categoría." });
  }
};

module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  updateSpecimenCategory,          // Este ahora solo actualiza 'name'
  deleteSpecimenCategory,
  updateSpecimenCategoryStatus   // <-- Exportar el nuevo controlador
};