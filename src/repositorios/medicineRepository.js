// src/repositorios/medicineRepository.js
const Medicine = require('../modelos/Medicine');
const Specimen = require('../modelos/Specimen');

const createMedicine = async (medicineData) => {
  try {
    const medicine = await Medicine.create(medicineData);
    return medicine;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw error;
  }
};

const getAllMedicines = async () => {
    try {
        //Eager loading related data with the include option
        return await Medicine.findAll({
            include: [{
                model: Specimen,
                as: 'specimen' // This alias must match the one defined in the association
            }]
        });
    } catch (error) {
        console.error("Error getting all medicines:", error);
        throw error;
    }
};

const getMedicineById = async (id) => {
  try {
    const medicine = await Medicine.findByPk(id, {
      include: [{
        model: Specimen,
        as: 'specimen'
      }]
    });
    return medicine;
  } catch (error) {
    console.error("Error getting medicine by ID:", error);
    throw error;
  }
};

const updateMedicine = async (id, medicineData) => {
  try {
      const [updatedRows] = await Medicine.update(medicineData, {
          where: { id: id }
      });

      if (updatedRows > 0) {
          // Update was successful, fetch the updated medicine
          const updatedMedicine = await Medicine.findByPk(id);
          return updatedMedicine; // Return the updated medicine object
      } else {
          return null; // Medicine not found
      }
  } catch (error) {
      console.error("Error updating medicine:", error);
      throw error;
  }
};

const deleteMedicine = async (id) => {
    try {
        const deletedRows = await Medicine.destroy({
            where: { id: id }
        });

        return deletedRows > 0;
    } catch (error) {
        console.error("Error deleting medicine:", error);
        throw error;
    }
};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
};