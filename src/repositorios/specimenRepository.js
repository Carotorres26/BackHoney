// src/repositorios/specimenRepository.js
const { Specimen, Client, Sede, SpecimenCategory, Contract } = require('../modelos/associations'); // Ajusta la ruta
const { Op } = require('sequelize');

// --- createSpecimen, getSpecimenById, updateSpecimen, deleteSpecimen (SIN CAMBIOS, usa tu versión existente) ---
// Si me los pasaste antes, ya deberían estar bien.

const createSpecimen = async (specimenData) => {
    console.log('[REPO createSpecimen] Data:', specimenData);
    // El hook afterCreate en tu modelo Specimen maneja el incremento de contador de cliente
    return await Specimen.create(specimenData);
};

const getAllSpecimens = async (filters = {}) => {
    console.log('[REPO getAllSpecimens] Filtros del servicio:', filters); // Log importante
    const queryOptions = {
        include: [
            {
                model: Client,
                as: 'propietario', // Alias definido en associations.js
                attributes: ['id', 'nombre', 'documento', 'email', 'celular'], // Campos necesarios para el frontend
                required: false // Un ejemplar podría no tener propietario si la FK permite null (aunque en tu modelo es allowNull: false)
            },
            {
                model: Sede,
                as: 'sede', // Alias definido en associations.js
                attributes: ['id', 'NombreSede'], // Asegúrate que 'NombreSede' sea el campo correcto
                required: false
            },
            {
                model: SpecimenCategory,
                as: 'category', // Alias definido en associations.js
                attributes: ['id', 'name'], // Asegúrate que 'name' sea el campo correcto
                required: false // Un ejemplar debería tener categoría, pero por si acaso
            },
            {
                model: Contract,
                as: 'contract', // Alias definido en associations.js (Specimen.belongsTo(Contract))
                attributes: ['id', 'fechaInicio', 'precioMensual'], // Solo necesitamos saber si existe para el filtro
                required: false // Fundamental para el filtro availableForContract
            }
        ],
        order: [['name', 'ASC']],
        where: {}
    };

    if (filters.id) { // Para buscar un ejemplar específico por ID
        queryOptions.where.id = filters.id;
    }
    if (filters.sedeId) {
        queryOptions.where.sedeId = filters.sedeId;
    }
    if (filters.clientId) {
        queryOptions.where.clientId = filters.clientId;
    }
    if (filters.categoryId) {
        queryOptions.where.specimenCategoryId = filters.categoryId;
    }
      if (filters.name) {
        queryOptions.where.name = { [Op.like]: `%${filters.name}%` };
    }

    // Filtro CRÍTICO para contratos:
    if (filters.availableForContract === true) {
        queryOptions.where.contractId = null; // Solo ejemplares SIN contrato
    } else if (filters.availableForContract === false) {
        queryOptions.where.contractId = { [Op.ne]: null }; // Ejemplares CON contrato (si se necesitara)
    }
    // Si availableForContract no se especifica, no se filtra por contractId

    if (Object.keys(queryOptions.where).length === 0) {
        delete queryOptions.where;
    }
    
    console.log('[REPO getAllSpecimens] Opciones finales de consulta:', JSON.stringify(queryOptions, null, 2)); // Log importante
    try {
        const specimens = await Specimen.findAll(queryOptions);
        console.log(`[REPO getAllSpecimens] Encontrados ${specimens.length} ejemplares.`);
        // Log para ver los primeros ejemplares y si traen el propietario
        // specimens.slice(0, 3).forEach(s => console.log({id: s.id, name: s.name, clientId: s.clientId, contractId: s.contractId, propietario: s.propietario ? s.propietario.toJSON() : null, contract: s.contract ? s.contract.toJSON() : null }));
        return specimens;
    } catch (error) {
        console.error('[REPO getAllSpecimens] Error en findAll:', error);
        throw error;
    }
};

const getSpecimenById = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return null;
    
    console.log(`[REPO getSpecimenById] ID: ${numericId}`);
    return await Specimen.findByPk(numericId, {
        include: [
            { model: Client, as: 'propietario', attributes: ['id', 'nombre', 'documento', 'email', 'celular'] },
            { model: Sede, as: 'sede', attributes: ['id', 'NombreSede'], required: false },
            { model: SpecimenCategory, as: 'category', attributes: ['id', 'name'] },
            { model: Contract, as: 'contract', attributes: ['id', 'fechaInicio', 'precioMensual'], required: false }
        ]
    });
};

const updateSpecimen = async (id, specimenData) => {
    const specimenId = parseInt(id, 10);
    if (isNaN(specimenId) || specimenId <= 0) throw new Error(`ID inválido: ${id}`);
    
    console.log(`[REPO updateSpecimen] ID: ${specimenId}, Data:`, specimenData);
    // El hook afterUpdate en tu modelo Specimen maneja el cambio de contadores de cliente
    const [numberOfAffectedRows] = await Specimen.update(specimenData, {
        where: { id: specimenId },
        individualHooks: true // Para que se ejecuten los hooks de Sequelize
    });
    if (numberOfAffectedRows > 0) {
        return await getSpecimenById(specimenId); // Devolver el ejemplar actualizado con sus includes
    }
    return null; // O podrías lanzar un error si no se encontró/actualizó
};

const deleteSpecimen = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) throw new Error("ID inválido para eliminar.");

    console.log(`[REPO deleteSpecimen] ID: ${numericId}`);
    // El hook afterDestroy en tu modelo Specimen maneja el decremento de contador de cliente
    return await Specimen.destroy({
        where: { id: numericId },
        individualHooks: true // Para que se ejecuten los hooks de Sequelize
    });
};

module.exports = {
    createSpecimen,
    getAllSpecimens,
    getSpecimenById,
    updateSpecimen,
    deleteSpecimen,
};