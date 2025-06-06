// src/servicios/specimenService.js
const specimenRepository = require('../repositorios/specimenRepository');
const SpecimenModel = require('../modelos/Specimen');
const { DataTypes } = require('sequelize');


class NotFoundError extends Error {
    constructor(message) { super(message); this.name = "NotFoundError"; this.statusCode = 404; }
}
class BadRequestError extends Error {
    constructor(message) { super(message); this.name = "BadRequestError"; this.statusCode = 400; }
}

const filterValidSpecimenFields = (data) => {
    if (!data || typeof data !== 'object') return {};
    const modelAttributes = SpecimenModel.rawAttributes || SpecimenModel.getAttributes();
    const filteredData = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && Object.prototype.hasOwnProperty.call(modelAttributes, key) && key !== 'id') {
            const attrDef = modelAttributes[key];
            let value = data[key];
            if (value === '' && (attrDef.allowNull === true || attrDef.allowNull === undefined)) {
                filteredData[key] = null;
            } else if (value !== null && value !== undefined) {
                if (attrDef.type instanceof DataTypes.INTEGER || attrDef.type instanceof DataTypes.BIGINT) {
                    filteredData[key] = isNaN(parseInt(value, 10)) ? value : parseInt(value, 10);
                } else if (attrDef.type instanceof DataTypes.FLOAT || attrDef.type instanceof DataTypes.DOUBLE || attrDef.type instanceof DataTypes.DECIMAL) {
                    filteredData[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                } else if (attrDef.type instanceof DataTypes.BOOLEAN) {
                    filteredData[key] = typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
                } else {
                    filteredData[key] = value;
                }
            } else if (value === null && attrDef.allowNull === true) {
                filteredData[key] = null;
            }
        }
    }
    return filteredData;
};

const createSpecimen = async (specimenData) => {
    const validData = filterValidSpecimenFields(specimenData);
    if (!validData.name || String(validData.name).trim() === '') throw new BadRequestError("El nombre del ejemplar es requerido.");
    if (validData.clientId === undefined || validData.clientId === null) throw new BadRequestError("El ID del cliente (propietario) es requerido.");
    if (validData.specimenCategoryId === undefined || validData.specimenCategoryId === null) throw new BadRequestError("El ID de la categoría es requerido.");

    // Opcional: Validar existencia de FKs aquí (ej. cliente, categoría, sede)
    // const client = await clientRepository.getById(validData.clientId);
    // if (!client) throw new NotFoundError(`Cliente con ID ${validData.clientId} no encontrado.`);
    try {
        return await specimenRepository.createSpecimen(validData);
    } catch (error) {
        if (error.name?.startsWith('Sequelize') || error.statusCode) throw error;
        throw new Error(error.message || "Error interno al crear el ejemplar.");
    }
};

const getAllSpecimens = async (filters = {}) => {
    try {
        return await specimenRepository.getAllSpecimens(filters);
    } catch (error) {
        throw new Error(error.message || "Error en el servicio al obtener ejemplares.");
    }
};

const getSpecimenById = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) throw new BadRequestError("ID de ejemplar inválido.");
    try {
        const specimen = await specimenRepository.getSpecimenById(numericId);
        if (!specimen) throw new NotFoundError('Ejemplar no encontrado.');
        return specimen;
    } catch (error) {
        if (error.name === 'NotFoundError') throw error;
        throw new Error(error.message || `Error interno al obtener ejemplar ID ${id}.`);
    }
};

const updateSpecimen = async (id, specimenData) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) throw new BadRequestError("ID de ejemplar inválido para actualizar.");
    
    const validData = filterValidSpecimenFields(specimenData);
    if (Object.keys(validData).length === 0) return await getSpecimenById(numericId);
    if (validData.hasOwnProperty('contractId')) delete validData.contractId;
    if (Object.keys(validData).length === 0) return await getSpecimenById(numericId);

    try {
        const existingSpecimen = await specimenRepository.getSpecimenById(numericId);
        if (!existingSpecimen) throw new NotFoundError('Ejemplar no encontrado para actualizar.');
        
        // Opcional: Validar existencia de FKs si se están cambiando
        await specimenRepository.updateSpecimen(numericId, validData);
        return await getSpecimenById(numericId);
    } catch (error) {
        if (error.name?.startsWith('Sequelize') || error.statusCode) throw error;
        throw new Error(error.message || `Error interno al actualizar ejemplar ID ${id}.`);
    }
};

const deleteSpecimen = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) throw new BadRequestError("ID de ejemplar inválido para eliminar.");
    try {
        const existingSpecimen = await specimenRepository.getSpecimenById(numericId);
        if (!existingSpecimen) throw new NotFoundError('Ejemplar no encontrado para eliminar.');
        if (existingSpecimen.contractId) {
            // Considera tu regla de negocio: ¿lanzar error o permitir?
            // throw new BadRequestError(`El ejemplar ID ${id} tiene un contrato activo. No se puede eliminar.`);
            console.warn(`[SVC deleteSpecimen] Ejemplar ID ${id} tiene contrato. Se procederá con el borrado.`);
        }
        const deletedRows = await specimenRepository.deleteSpecimen(numericId);
        return deletedRows > 0;
    } catch (error) {
        if (error.name === 'NotFoundError' || error.name === 'BadRequestError') throw error;
        throw new Error(error.message || `Error interno al eliminar ejemplar ID ${id}.`);
    }
};

const moveSpecimen = async (id, sedeIdInput, specimenCategoryIdInput) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) throw new BadRequestError("ID de ejemplar inválido para mover.");

    const dataToUpdate = {};
    let dataProvided = false;

    if (sedeIdInput !== undefined) {
        dataProvided = true;
        const sedeId = (sedeIdInput === null || String(sedeIdInput).toLowerCase() === 'null' || String(sedeIdInput).trim() === '') ? null : parseInt(sedeIdInput, 10);
        if (sedeId !== null && (isNaN(sedeId) || sedeId <= 0)) throw new BadRequestError("ID de sede inválido.");
        dataToUpdate.sedeId = sedeId;
    }
    if (specimenCategoryIdInput !== undefined) {
        dataProvided = true;
        const categoryId = parseInt(specimenCategoryIdInput, 10);
        if (isNaN(categoryId) || categoryId <= 0) throw new BadRequestError("ID de categoría inválido.");
        dataToUpdate.specimenCategoryId = categoryId;
    }
    
    if (!dataProvided) return await getSpecimenById(numericId);

    try {
         const existingSpecimen = await specimenRepository.getSpecimenById(numericId);
         if (!existingSpecimen) throw new NotFoundError('Ejemplar no encontrado para mover.');

         let hasChanges = false;
         if (dataToUpdate.hasOwnProperty('sedeId') && existingSpecimen.sedeId !== dataToUpdate.sedeId) hasChanges = true;
         if (dataToUpdate.hasOwnProperty('specimenCategoryId') && existingSpecimen.specimenCategoryId !== dataToUpdate.specimenCategoryId) hasChanges = true;
         if (!hasChanges) return existingSpecimen;
         
         await specimenRepository.updateSpecimen(numericId, dataToUpdate);
         return await getSpecimenById(numericId);
    } catch (error) {
        if (error.name === 'NotFoundError' || error.name === 'BadRequestError') throw error;
        throw new Error(error.message || `Error interno al mover ejemplar ID ${id}.`);
    }
};

module.exports = {
    createSpecimen,
    getAllSpecimens,
    getSpecimenById,
    updateSpecimen,
    deleteSpecimen,
    moveSpecimen,
};