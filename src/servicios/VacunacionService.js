// src/servicios/VacunacionService.js

// --- IMPORTANTE: Importa el modelo Vacunacion correctamente ---
// Asume que tu archivo se llama Vacunacion.js (con V mayúscula)
const Vacunacion = require('../modelos/Vacunacion');
// Importa Specimen si lo usas en los includes
const Specimen = require('../modelos/Specimen');

// Ya no necesitas el repositorio si defines la lógica aquí
// const vacunacionRepository = require('../repositorios/VacunacionRepository');

const createVacunacion = async (vacunacionData) => {
  try {
    const nuevoRegistro = await Vacunacion.create(vacunacionData); // Usa el modelo directamente
    return nuevoRegistro;
  } catch (error) {
    console.error("Service Error creating vacunacion:", error);
    throw error; // Re-lanzar para el controlador
  }
};

const getAllVacunaciones = async () => {
  try {
    // Usa el modelo directamente e incluye el espécimen
    return await Vacunacion.findAll({
        include: [{
            model: Specimen,
            as: 'specimen', // <-- ASEGÚRATE QUE ESTE ALIAS EXISTA en associations.js
            attributes: ['id', 'name']
        }],
        order: [['fechaAdministracion', 'DESC']] // Ordenar por fecha
    });
  } catch (error) {
     console.error("Service Error getting all vacunaciones:", error);
     throw error;
  }
};

const getVacunacionById = async (id) => {
  try {
    // Usa el modelo directamente
    return await Vacunacion.findByPk(id, {
         include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
    });
  } catch (error) {
     console.error(`Service Error getting vacunacion by ID ${id}:`, error);
     throw error;
  }
};

const updateVacunacion = async (id, vacunacionData) => {
  try {
    const registro = await Vacunacion.findByPk(id);
    if (!registro) {
        return null; // O lanzar error
    }
    await registro.update(vacunacionData);
    // Devolver actualizado con espécimen
    return registro.reload({
        include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
    });
  } catch (error) {
     console.error(`Service Error updating vacunacion ${id}:`, error);
     throw error;
  }
};

const deleteVacunacion = async (id) => {
  try {
    const deletedRows = await Vacunacion.destroy({ where: { id: id } });
    return deletedRows > 0;
  } catch (error) {
     console.error(`Service Error deleting vacunacion ${id}:`, error);
     throw error;
  }
};

/**
 * Obtiene todos los registros de vacunación para un espécimen específico.
 * @param {number} specimenId - ID del espécimen.
 * @returns {Promise<Array<Vacunacion>>} Lista de registros de vacunación.
 */
const getVacunacionBySpecimenId = async (specimenId) => {
  try {
      return Vacunacion.findAll({
        where: { specimenId: specimenId }, // Condición de filtrado
        // No es necesario incluir el espécimen aquí si solo muestras datos de vacunación
        order: [['fechaAdministracion', 'DESC']] // Ordenar por fecha
      });
  } catch (error) {
      console.error(`Service Error fetching vacunacion for specimen ${specimenId}:`, error);
      throw error; // Re-lanzar para el controlador
  }
};

module.exports = {
  createVacunacion,
  getAllVacunaciones,
  getVacunacionById,
  updateVacunacion,
  deleteVacunacion,
  getVacunacionBySpecimenId // Asegúrate de exportar la nueva función
};