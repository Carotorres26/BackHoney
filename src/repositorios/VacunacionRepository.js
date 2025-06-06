// src/repositorios/VacunacionRepository.js
const Vacunacion = require('../modelos/Vacunacion');
const Specimen = require('../modelos/Specimen'); // Para incluir en las lecturas

// Función para crear un nuevo registro de vacunación
const createVacunacion = async (vacunacionData) => {
  try {
    const nuevoRegistro = await Vacunacion.create(vacunacionData);
    return nuevoRegistro;
  } catch (error) {
    console.error("Error en repositorio al crear vacunación:", error);
    throw error;
  }
};

// Función para obtener todos los registros de vacunación
const getAllVacunaciones = async () => {
  try {
    const vacunaciones = await Vacunacion.findAll({
      include: [{
        model: Specimen,
        as: 'specimen' // Alias de la asociación Vacunacion.belongsTo(Specimen)
        // attributes: ['id', 'name'] // Opcional: limitar campos de Specimen
      }],
      // Podrías ordenar por fecha si quisieras:
      // order: [['fechaAdministracion', 'DESC']]
    });
    return vacunaciones;
  } catch (error) {
    console.error("Error en repositorio al obtener todas las vacunaciones:", error);
    throw error;
  }
};

// Función para obtener un registro de vacunación por su ID
const getVacunacionById = async (id) => {
  try {
    const registro = await Vacunacion.findByPk(id, {
      include: [{
        model: Specimen,
        as: 'specimen'
      }]
    });
    return registro; // Devuelve el registro o null
  } catch (error) {
    console.error("Error en repositorio al obtener vacunación por ID:", error);
    throw error;
  }
};

// Función para actualizar un registro de vacunación por su ID
const updateVacunacion = async (id, vacunacionData) => {
  try {
    const [numFilasActualizadas] = await Vacunacion.update(vacunacionData, {
      where: { id: id }
    });

    if (numFilasActualizadas > 0) {
      const registroActualizado = await Vacunacion.findByPk(id, {
         include: [{ model: Specimen, as: 'specimen' }]
      });
      return registroActualizado;
    } else {
      return null; // No encontrado
    }
  } catch (error) {
    console.error("Error en repositorio al actualizar vacunación:", error);
    throw error;
  }
};

// Función para eliminar un registro de vacunación por su ID
const deleteVacunacion = async (id) => {
  try {
    const numFilasEliminadas = await Vacunacion.destroy({
      where: { id: id }
    });
    return numFilasEliminadas > 0; // true si se eliminó, false si no
  } catch (error) {
    console.error("Error en repositorio al eliminar vacunación:", error);
    throw error;
  }
};

module.exports = {
  createVacunacion,
  getAllVacunaciones,
  getVacunacionById,
  updateVacunacion,
  deleteVacunacion
};