// src/servicios/specimenCategoryService.js
const specimenCategoryRepository = require('../repositorios/specimenCategoryRepository');
const { SpecimenCategory, Specimen, Op } = require('../modelos/associations'); // Importa Op si lo usas directamente aquí

// --- FUNCIONES EXISTENTES (Revisadas ligeramente para consistencia) ---
const createSpecimenCategory = async (specimenCategoryData) => {
  try {
    const { name, estado } = specimenCategoryData; // Puede venir 'estado' opcionalmente
    if (!name || name.trim().length < 3) {
        const error = new Error("El nombre de la categoría es requerido (mínimo 3 caracteres).");
        error.statusCode = 400;
        throw error;
    }
    const dataToCreate = { name: name.trim() };
    if (estado !== undefined && (estado === 'activo' || estado === 'inactivo')) {
        dataToCreate.estado = estado;
    }
    // El repositorio debería manejar la creación y el error de unicidad
    const newCategory = await specimenCategoryRepository.createSpecimenCategory(dataToCreate);
    return newCategory;
  } catch (error) {
      if (error.message.includes('ya existe') || error.name === 'SequelizeUniqueConstraintError') {
           const err = new Error(error.message || `El nombre de categoría '${specimenCategoryData.name}' ya existe.`);
           err.statusCode = 409; // Conflict
           throw err;
      }
      console.error("Error Service (createSpecimenCategory):", error.message);
      // Propagar el error con su statusCode si ya lo tiene, o crear uno nuevo
      if (error.statusCode) throw error;
      throw new Error(error.message || "Error interno al crear la categoría.");
  }
};

const getAllSpecimenCategories = async (includeInactive = false) => {
  try {
    const options = { scope: includeInactive ? 'all' : 'active' };
    return await specimenCategoryRepository.getAllSpecimenCategories(options);
  } catch (error) {
      console.error("Error Service (getAllSpecimenCategories):", error.message);
      throw new Error(error.message || "Error al obtener las categorías.");
  }
};

const getSpecimenCategoryById = async (id) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId) || categoryId <= 0) {
        const error = new Error("ID de categoría inválido proporcionado al servicio.");
        error.statusCode = 400;
        throw error;
    }
  try {
    // El repositorio debe usar unscoped para encontrarla si está inactiva
    const category = await specimenCategoryRepository.getSpecimenCategoryById(categoryId);
    if (!category) {
      const error = new Error('Categoría de ejemplar no encontrada.');
      error.statusCode = 404;
      throw error;
    }
    return category;
  } catch (error) {
      if (![400, 404].includes(error.statusCode)) {
           console.error(`Error Service (getSpecimenCategoryById ${id}):`, error.message);
      }
      // Propagar el error con su statusCode si ya lo tiene, o crear uno nuevo
      if (error.statusCode) throw error;
      throw new Error(error.message || "Error interno al obtener la categoría por ID.");
  }
};

const deleteSpecimenCategory = async (id) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId) || categoryId <= 0) {
        const error = new Error("ID de categoría inválido para eliminar.");
        error.statusCode = 400;
        throw error;
     }
  try {
     // 1. Verificar existencia (el repositorio debería usar unscoped)
     const category = await specimenCategoryRepository.getSpecimenCategoryById(categoryId);
     if (!category) {
       const error = new Error('Categoría no encontrada para eliminar.');
       error.statusCode = 404;
       throw error;
     }
     // 2. Verificar si tiene especímenes asociados (middleware ya lo hizo, pero una doble verificación no está mal)
     const specimenCount = await Specimen.count({ where: { specimenCategoryId: categoryId } });
     if (specimenCount > 0) {
         const error = new Error(`No se puede eliminar la categoría porque tiene ${specimenCount} ejemplar(es) asociado(s). Considere desactivarla en su lugar.`);
         error.statusCode = 409; // Conflict
         throw error;
     }
     // 3. Proceder con la eliminación
     const deletedCount = await specimenCategoryRepository.deleteSpecimenCategory(categoryId);
     if (deletedCount === 0) { // Podría pasar si se borró entre la verificación y la eliminación
        const error = new Error('No se pudo eliminar la categoría (0 filas afectadas), puede que ya haya sido eliminada.');
        error.statusCode = 404; // O 500 si se considera un error inesperado
        throw error;
     }
     return true;
  } catch (error) {
       if (![400, 404, 409].includes(error.statusCode)) { // No loguear errores ya manejados
          console.error(`Error Service (deleteSpecimenCategory ${id}):`, error.message);
      }
      if (error.statusCode) throw error;
      throw new Error(error.message || "Error interno al eliminar la categoría.");
  }
};

// --- FUNCIÓN PARA ACTUALIZAR SOLO EL NOMBRE (usada por PUT /:id) ---
const updateSpecimenCategoryName = async (id, newName) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId) || categoryId <= 0) {
        const error = new Error("ID de categoría inválido para actualizar nombre.");
        error.statusCode = 400;
        throw error;
    }
    if (newName === undefined || newName === null || typeof newName !== 'string' || newName.trim().length < 3) {
        const error = new Error("Se requiere un nombre válido (mínimo 3 caracteres) para actualizar la categoría.");
        error.statusCode = 400;
        throw error;
    }

    const trimmedName = newName.trim();

    // El repositorio debe usar unscoped para encontrarla si está inactiva
    const categoryToUpdate = await specimenCategoryRepository.getSpecimenCategoryById(categoryId);
    if (!categoryToUpdate) {
        const error = new Error('Categoría no encontrada para actualizar nombre.');
        error.statusCode = 404;
        throw error;
    }

    // Verificar unicidad del nuevo nombre (excluyendo la categoría actual)
    // Esta lógica podría estar en el repositorio o aquí.
    const existingWithSameName = await SpecimenCategory.unscoped().findOne({
        where: {
            name: trimmedName,
            id: { [Op.ne]: categoryId } // Excluir la categoría actual de la búsqueda de duplicados
        }
    });
    if (existingWithSameName) {
        const error = new Error(`El nombre de categoría '${trimmedName}' ya está en uso por otra categoría.`);
        error.statusCode = 409; // Conflict
        throw error;
    }

    // El repositorio se encarga de la actualización
    const [affectedRows] = await specimenCategoryRepository.updateSpecimenCategory(categoryId, { name: trimmedName });

    if (affectedRows === 0) {
        // Podría ser que el nombre sea el mismo y no hubo cambio en la BD
        console.warn(`[SpecimenCategoryService] UpdateName ID ${categoryId} afectó 0 filas (nombre igual o no encontrada por el repositorio).`);
        // Devolver la categoría existente si el nombre era el mismo.
        // Si el repositorio no la encontró pero este servicio sí, es un problema de consistencia.
        if (categoryToUpdate.name === trimmedName) return categoryToUpdate;
        const error = new Error('No se pudo actualizar el nombre de la categoría o no se encontró.');
        error.statusCode = 404; // O 304 si el nombre no cambió
        throw error;
    }
    // Devolver la categoría actualizada buscándola de nuevo para tener el objeto completo y fresco
    return specimenCategoryRepository.getSpecimenCategoryById(categoryId);
};

// --- FUNCIÓN PARA ACTUALIZAR SOLO EL ESTADO (usada por PATCH /:id/status) ---
const updateSpecimenCategoryStatus = async (id, newStatus) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId) || categoryId <= 0) {
        const error = new Error("ID de categoría inválido para actualizar estado.");
        error.statusCode = 400;
        throw error;
    }
    if (newStatus !== 'activo' && newStatus !== 'inactivo') {
        const error = new Error("El valor de 'estado' debe ser 'activo' o 'inactivo'.");
        error.statusCode = 400;
        throw error;
    }

    // El repositorio debe usar unscoped
    const categoryToUpdate = await specimenCategoryRepository.getSpecimenCategoryById(categoryId);
    if (!categoryToUpdate) {
        const error = new Error('Categoría no encontrada para actualizar estado.');
        error.statusCode = 404;
        throw error;
    }

    if (categoryToUpdate.estado === newStatus) {
        console.log(`El estado de la categoría ${categoryId} ya es '${newStatus}'. No se requiere actualización.`);
        return categoryToUpdate; // Devolver la categoría sin cambios
    }

    // El repositorio se encarga de la actualización
    const [affectedRows] = await specimenCategoryRepository.updateSpecimenCategory(categoryId, { estado: newStatus });

    if (affectedRows === 0) {
        // Esto sería inesperado si categoryToUpdate.estado !== newStatus
        console.error(`[SpecimenCategoryService] UpdateStatus ID ${categoryId} afectó 0 filas inesperadamente.`);
        const error = new Error('No se pudo actualizar el estado de la categoría.');
        error.statusCode = 500;
        throw error;
    }
    // Devolver la categoría actualizada buscándola de nuevo
    return specimenCategoryRepository.getSpecimenCategoryById(categoryId);
};


module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  // updateSpecimenCategory, // Quitar la función antigua que manejaba ambos
  updateSpecimenCategoryName,   // Nueva función para solo nombre
  updateSpecimenCategoryStatus, // Nueva función para solo estado
  deleteSpecimenCategory,
};