// src/repositorios/AlimentacionRepository.js
const Alimentacion = require('../modelos/Alimentación');
const Specimen = require('../modelos/Specimen'); // Importamos Specimen para incluirlo al leer

// Función para crear un nuevo registro de alimentación
const createAlimentacion = async (alimentacionData) => {
  try {
    const nuevoRegistro = await Alimentacion.create(alimentacionData);
    return nuevoRegistro;
  } catch (error) {
    // Loguear el error específico podría ser útil aquí también
    console.error("Error en repositorio al crear alimentación:", error);
    throw error; // Re-lanzar el error para que el servicio lo maneje
  }
};

// Función para obtener todos los registros de alimentación (con datos del espécimen)
const getAllAlimentaciones = async () => {
  try {
    const alimentaciones = await Alimentacion.findAll({
      include: [{
        model: Specimen,
        as: 'specimen' // El alias que definimos en associations.js
        // Puedes añadir attributes: ['id', 'name'] para traer solo algunos campos del Specimen
      }]
    });
    return alimentaciones;
  } catch (error) {
    console.error("Error en repositorio al obtener todas las alimentaciones:", error);
    throw error;
  }
};

// Función para obtener un registro de alimentación por su ID (con datos del espécimen)
const getAlimentacionById = async (id) => {
  try {
    const registro = await Alimentacion.findByPk(id, {
      include: [{
        model: Specimen,
        as: 'specimen'
      }]
    });
    return registro; // Devuelve el registro encontrado o null si no existe
  } catch (error) {
    console.error("Error en repositorio al obtener alimentación por ID:", error);
    throw error;
  }
};

// Función para actualizar un registro de alimentación por su ID
const updateAlimentacion = async (id, alimentacionData) => {
  try {
    const [numFilasActualizadas] = await Alimentacion.update(alimentacionData, {
      where: { id: id }
    });

    // Si se actualizó al menos una fila, busca y devuelve el registro actualizado
    if (numFilasActualizadas > 0) {
      const registroActualizado = await Alimentacion.findByPk(id, {
        include: [{ model: Specimen, as: 'specimen' }] // Incluir espécimen en la respuesta
      });
      return registroActualizado;
    } else {
      return null; // Indica que no se encontró el registro con ese ID
    }
  } catch (error) {
    console.error("Error en repositorio al actualizar alimentación:", error);
    throw error;
  }
};

// Función para eliminar un registro de alimentación por su ID
const deleteAlimentacion = async (id) => {
  try {
    const numFilasEliminadas = await Alimentacion.destroy({
      where: { id: id }
    });
    return numFilasEliminadas > 0; // Devuelve true si se eliminó algo, false si no
  } catch (error) {
    console.error("Error en repositorio al eliminar alimentación:", error);
    throw error;
  }
};

module.exports = {
  createAlimentacion,
  getAllAlimentaciones,
  getAlimentacionById,
  updateAlimentacion,
  deleteAlimentacion
};