// src/repositorios/specimenCategoryRepository.js
const SpecimenCategory = require('../modelos/SpecimenCategory'); // Verifica la ruta a tu modelo

/**
 * Crea una nueva categoría de ejemplar.
 * @param {object} specimenCategoryData - Datos para crear ({ name: '...' }).
 * @returns {Promise<Model>} La instancia de la categoría creada (incluyendo campos por defecto).
 */
const createSpecimenCategory = async (specimenCategoryData) => {
  try {
      const newCategory = await SpecimenCategory.create({ name: specimenCategoryData.name });
      // Devolver la instancia completa buscándola por PK
      return SpecimenCategory.findByPk(newCategory.id);
  } catch (error) {
      console.error("[SpecimenCategoryRepo:create] Error:", error);
      if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error(`El nombre de categoría '${specimenCategoryData.name}' ya está en uso.`);
      }
      throw error;
  }
};

/**
 * Obtiene todas las categorías de ejemplares, aplicando scopes y devolviendo campos necesarios.
 * MODIFICADO para usar unscoped() de forma más explícita.
 * @param {object} options - Opciones, principalmente { scope: 'all' | 'active' }.
 * @returns {Promise<Array<Model>>} Un array de categorías.
 */
const getAllSpecimenCategories = async (options = {}) => {
  try {
      const includeInactive = options.scope === 'all';
      const queryOptions = {
          order: options.order || [['name', 'ASC']],
          // Asegurar que devuelve los campos necesarios
          attributes: ['id', 'name', 'estado']
      };

      let categories;

      if (includeInactive) {
          console.log(`[SpecimenCategoryRepo:getAll] Using unscoped().findAll()`);
          // --- USA unscoped() explícitamente para ignorar defaultScope ---
          categories = await SpecimenCategory.unscoped().findAll(queryOptions);
          // --- FIN CAMBIO ---
      } else {
          console.log(`[SpecimenCategoryRepo:getAll] Using scope: active`);
           // Sigue usando el scope 'active' definido en el modelo
           // Si esto fallara, podríamos usar unscoped().findAll({ where: { estado: 'activo' }, ...queryOptions })
          categories = await SpecimenCategory.scope('active').findAll(queryOptions);
      }

      console.log(`[SpecimenCategoryRepo:getAll] Found ${categories.length} categories in DB query.`);
      return categories;
  } catch (error) {
      console.error("[SpecimenCategoryRepo:getAll] Error:", error);
      throw error;
  }
};

/**
 * Obtiene una categoría específica por ID, sin aplicar scopes por defecto.
 * @param {number|string} id - El ID de la categoría.
 * @param {object} options - Opciones adicionales (raramente necesarias aquí).
 * @returns {Promise<Model|null>} La instancia de la categoría o null si no se encuentra.
 */
const getSpecimenCategoryById = async (id, options = {}) => {
   const numericId = parseInt(id, 10);
   if (isNaN(numericId) || numericId <= 0) {
       console.error(`[SpecimenCategoryRepo:getById] ID inválido: ${id}`);
       return null;
   }
   try {
        const queryOptions = {
            ...options,
            attributes: ['id', 'name', 'estado'] // Asegurar que devuelve estado
        };
        // Usar unscoped() es crucial para encontrar por ID sin importar el estado ni defaultScope
        const category = await SpecimenCategory.unscoped().findByPk(numericId, queryOptions);
        console.log(`[SpecimenCategoryRepo:getById ${id}] Found:`, category ? category.toJSON() : null);
        return category;
   } catch (error) {
        console.error(`[SpecimenCategoryRepo:getById ${id}] Error:`, error);
        throw error;
   }
};

/**
 * Actualiza una categoría por ID con los datos proporcionados.
 * @param {number|string} id - El ID de la categoría a actualizar.
 * @param {object} specimenCategoryData - Objeto con los campos a actualizar (ej. { name: '...' } o { estado: '...' }).
 * @returns {Promise<Array<number>>} Un array indicando el número de filas afectadas (ej. [1] o [0]).
 */
const updateSpecimenCategory = async (id, specimenCategoryData) => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || !specimenCategoryData || Object.keys(specimenCategoryData).length === 0) {
        const error = new Error("ID o datos inválidos para actualizar categoría en repositorio.");
        error.statusCode = 400;
        throw error;
  }
  console.log(`[SpecimenCategoryRepo:update ${id}] Updating with data:`, specimenCategoryData);
  try {
      // Usar unscoped() para poder actualizar categorías inactivas
      return await SpecimenCategory.unscoped().update(specimenCategoryData, {
          where: { id: numericId }
       });
  } catch (error) {
       console.error(`[SpecimenCategoryRepo:update ${id}] Error:`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error(`El nombre de categoría '${specimenCategoryData.name}' ya está en uso.`);
        }
       throw error;
  }
};

/**
 * Elimina una categoría por ID.
 * @param {number|string} id - El ID de la categoría a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (0 o 1).
 */
const deleteSpecimenCategory = async (id) => {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
      console.error(`[SpecimenCategoryRepo:delete] ID inválido: ${id}`);
      throw new Error("ID inválido para eliminar categoría.");
  }
  try {
      // Usar unscoped() para poder borrar categorías inactivas
      return await SpecimenCategory.unscoped().destroy({ where: { id: numericId } });
  } catch (error) {
      console.error(`[SpecimenCategoryRepo:delete ${id}] Error:`, error);
      throw error;
  }
};

// Exportar todas las funciones del repositorio
module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  updateSpecimenCategory,
  deleteSpecimenCategory
};