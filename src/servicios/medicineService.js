// src/servicios/medicineService.js
const Medicine = require('../modelos/Medicine'); // Importa el modelo Medicine
const Specimen = require('../modelos/Specimen'); // Importa Specimen si necesitas incluirlo en las queries

const createMedicine = async (medicineData) => {
    // Considera incluir el espécimen al crear si quieres devolverlo
    // return Medicine.create(medicineData, { include: [{ model: Specimen, as: 'specimen' }] });
    return Medicine.create(medicineData);
};

const getAllMedicines = async () => {
    // Incluye el modelo Specimen para obtener la info del espécimen asociado
    return Medicine.findAll({
        include: [{
            model: Specimen,
            as: 'specimen', // Asegúrate que este alias exista en associations.js
            attributes: ['id', 'name'] // Trae solo id y nombre del espécimen
        }],
        order: [['createdAt', 'DESC']] // Ordena por fecha de creación descendente
    });
};

const getMedicineById = async (id) => {
    return Medicine.findByPk(id, {
         include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
    });
};

const updateMedicine = async (id, medicineData) => {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
        return null; // O lanza un error si prefieres
    }
    await medicine.update(medicineData);
    // Devolver la instancia actualizada con el espécimen
    return medicine.reload({
        include: [{ model: Specimen, as: 'specimen', attributes: ['id', 'name'] }]
    });
};

const deleteMedicine = async (id) => {
    const result = await Medicine.destroy({
        where: { id: id }
    });
    return result > 0; // Devuelve true si se eliminó al menos 1 fila
};

/**
 * Actualiza únicamente el estado de una medicina específica.
 * @param {number} id - ID de la medicina.
 * @param {string} nuevoEstado - El nuevo estado ('Programado', 'Administrado', 'Cancelado').
 * @returns {Promise<Array<number>>} Un array con el número de filas afectadas.
 */
const updateMedicineEstado = async (id, nuevoEstado) => {
    const [affectedRows] = await Medicine.update(
        { estado: nuevoEstado },
        { where: { id: id } }
    );
    return [affectedRows];
};

/**
 * Obtiene todos los registros de medicinas para un espécimen específico.
 * @param {number} specimenId - ID del espécimen.
 * @returns {Promise<Array<Medicine>>} Lista de registros de medicinas.
 */
const getMedicineBySpecimenId = async (specimenId) => {
    return Medicine.findAll({
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
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    updateMedicineEstado,
    getMedicineBySpecimenId
};