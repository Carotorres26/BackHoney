const SpecimenCategory = require('../modelos/SpecimenCategory');

const validateSpecimenCategoryStatus = async (req, res, next) => {
    const { specimenCategoryId } = req.body;

    try {
        const specimenCategory = await SpecimenCategory.findByPk(specimenCategoryId);
        if (!specimenCategory) {
            return res.status(400).json({ message: 'La categoría de ejemplar no existe.' });
        }

        if (specimenCategory.estado === 'inactivo') {
            return res.status(400).json({ message: 'No se puede agregar un ejemplar a una categoría inactiva.' });
        }

        next();
    } catch (error) {
        console.error('Error al validar el estado de la categoría:', error);
        res.status(500).json({ message: 'Error al validar el estado de la categoría.', error: error.message });
    }
};

module.exports = {
    validateSpecimenCategoryStatus
};