// src/servicios/AlimentacionService.js
const Alimentacion = require('../modelos/Alimentación'); // Importa el modelo Alimentacion
const Specimen = require('../modelos/Specimen'); // Importa Specimen para incluirlo

const createAlimentacion = async (alimentacionData) => {
  return Alimentacion.create(alimentacionData);
};

const getAllAlimentaciones = async () => {
  return Alimentacion.findAll({
      include: [{
          model: Specimen,
          as: 'specimen', // Asegúrate que este alias exista en associations.js
          attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
  });
};

const getAlimentacionById = async (id) => {
  return Alimentacion.findByPk(id, {
      include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
  });
};

const updateAlimentacion = async (id, alimentacionData) => {
    const registro = await Alimentacion.findByPk(id);
    if (!registro) {
        return null;
    }
    await registro.update(alimentacionData);
    // Devolver instancia actualizada con espécimen
    return registro.reload({
         include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
    });
};

const deleteAlimentacion = async (id) => {
  const result = await Alimentacion.destroy({ where: { id: id } });
  return result > 0;
};

/**
 * Actualiza únicamente el estado de un registro de alimentación.
 * @param {number} id - ID del registro.
 * @param {string} nuevoEstado - El nuevo estado ('Programado', 'Administrado', 'Cancelado').
 * @returns {Promise<Array<number>>} Un array con el número de filas afectadas.
 */
const updateAlimentacionEstado = async (id, nuevoEstado) => {
    const [affectedRows] = await Alimentacion.update(
        { estado: nuevoEstado },
        { where: { id: id } }
    );
    return [affectedRows];
};

/**
 * Obtiene todos los registros de alimentación para un espécimen específico.
 * @param {number} specimenId - ID del espécimen.
 * @returns {Promise<Array<Alimentacion>>} Lista de registros de alimentación.
 */
const getAlimentacionBySpecimenId = async (specimenId) => {
  return Alimentacion.findAll({
    where: { specimenId: specimenId }, // Condición de filtrado
    include: [{ // Opcional: incluir espécimen si quieres confirmar
        model: Specimen,
        as: 'specimen',
        attributes: ['id', 'name']
    }],
    order: [['createdAt', 'DESC']] // Ordenar por fecha
  });
};

module.exports = {
  createAlimentacion,
  getAllAlimentaciones,
  getAlimentacionById,
  updateAlimentacion,
  deleteAlimentacion,
  updateAlimentacionEstado,
  getAlimentacionBySpecimenId
};