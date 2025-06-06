const serviceRepository = require('../repositorios/serviceRepository');
const fs = require('fs');
const path = require('path');
const Service = require('../modelos/Service'); // Use direct model access for unscoped

const createService = async (serviceData, fileInfo) => {
  console.log("[Service:createService] Datos:", serviceData, "File:", fileInfo);
  try {
    const dataToSave = {
      nombre: serviceData.nombre?.trim(),
      descripcion: serviceData.descripcion?.trim() || null,
      imagen: fileInfo ? fileInfo.path : null,
      // Status defaults to true in model
    };

    if (!dataToSave.nombre) {
        throw new Error("El nombre del servicio es obligatorio.");
    }

    const newService = await serviceRepository.createService(dataToSave);
    // Find unscoped to return full data including status
    return Service.unscoped().findByPk(newService.id);
  } catch (error) {
    console.error("Error en serviceService.createService:", error);
    if (fileInfo?.path) {
       fs.unlink(fileInfo.path, (err) => { if (err) console.error("Error borrando archivo tras fallo:", err);});
    }
     if (error.name === 'SequelizeUniqueConstraintError') {
         throw new Error(`El nombre de servicio '${serviceData.nombre?.trim()}' ya está en uso.`);
    }
    throw new Error(error.message || "Error al crear el servicio.");
  }
};

const updateService = async (id, serviceData, fileInfo) => {
    console.log(`[Service:updateService ID: ${id}] Datos:`, serviceData, "File:", fileInfo);
    try {
        const serviceId = parseInt(id, 10);
        if (isNaN(serviceId)) {
             const error = new Error("ID de servicio inválido.");
             error.statusCode = 400;
             throw error;
         }

        // Find unscoped to update regardless of current status
        const existingService = await Service.unscoped().findByPk(serviceId);
        if (!existingService) {
            const error = new Error('Servicio no encontrado.');
            error.statusCode = 404;
            throw error;
        }
        const oldImagePath = existingService.imagen;

        const dataToUpdate = {};
        if (serviceData.nombre !== undefined) dataToUpdate.nombre = serviceData.nombre.trim();
        if (serviceData.descripcion !== undefined) dataToUpdate.descripcion = serviceData.descripcion.trim() || null;

        let newImagePath = null;
        if (fileInfo) {
            newImagePath = fileInfo.path;
            dataToUpdate.imagen = newImagePath;
        }

        if (Object.keys(dataToUpdate).length > 0) {
             await Service.unscoped().update(dataToUpdate, { where: { id: serviceId } });
        } else {
            console.log(`[Service:updateService ID: ${id}] No data provided for update.`);
        }

        if (newImagePath && oldImagePath && oldImagePath !== newImagePath) {
             const absoluteOldPath = path.resolve(oldImagePath);
             fs.unlink(absoluteOldPath, (unlinkErr) => {
                  if (unlinkErr && unlinkErr.code !== 'ENOENT') console.error(`Error borrando imagen antigua ${absoluteOldPath}:`, unlinkErr);
                  else if (!unlinkErr) console.log(`Imagen antigua ${absoluteOldPath} borrada.`);
             });
        }

        // Return unscoped version after update
        return Service.unscoped().findByPk(serviceId);

    } catch (error) {
        if (fileInfo?.path) {
            if (error.statusCode !== 404) { // Don't delete if service wasn't found
               fs.unlink(fileInfo.path, (err) => { if (err) console.error("Error borrando archivo nuevo tras fallo:", err);});
            }
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`El nombre de servicio '${serviceData.nombre?.trim()}' ya está en uso.`);
        }
        if (![400, 404].includes(error.statusCode)) {
            console.error(`Error en serviceService.updateService (ID: ${id}):`, error);
        }
        throw error;
    }
};

const getAllServices = async (includeInactive = false) => {
    try {
        const queryOptions = {
            order: [['nombre', 'ASC']]
        };
        const scope = includeInactive ? Service.unscoped() : Service;
        return await scope.findAll(queryOptions);
    } catch (error) {
        console.error("Error en serviceService.getAllServices:", error);
        throw new Error("Error al obtener los servicios.");
    }
};

const getServiceById = async (id) => {
    try {
        const serviceId = parseInt(id, 10);
         if (isNaN(serviceId)) {
             const error = new Error("ID de servicio inválido.");
             error.statusCode = 400;
             throw error;
         }
        // Use unscoped to get regardless of status
        const service = await Service.unscoped().findByPk(serviceId);
        if (!service) {
            const error = new Error('Servicio no encontrado');
            error.statusCode = 404;
            throw error;
        }
        return service;
    } catch (error) {
        if (![400, 404].includes(error.statusCode)) {
             console.error(`Error en serviceService.getServiceById (ID: ${id}):`, error);
        }
        throw error;
    }
};

const deleteService = async (id) => {
   try {
        const serviceId = parseInt(id, 10);
        if (isNaN(serviceId)) {
             const error = new Error("ID de servicio inválido.");
             error.statusCode = 400;
             throw error;
         }

        // Find unscoped first
        const serviceToDelete = await Service.unscoped().findByPk(serviceId);
        if (!serviceToDelete) {
             const error = new Error('Servicio no encontrado para eliminar');
             error.statusCode = 404;
             throw error;
        }

        // Destroy unscoped
        const deletedCount = await Service.unscoped().destroy({ where: { id: serviceId } });
        if (deletedCount === 0) {
            console.warn(`[Service:deleteService ID: ${id}] Delete operation affected 0 rows.`);
             const error = new Error('Servicio no encontrado para eliminar (post-check)');
             error.statusCode = 404;
             throw error;
        }

        if (serviceToDelete.imagen) {
             const absolutePath = path.resolve(serviceToDelete.imagen);
             fs.unlink(absolutePath, (unlinkErr) => {
                  if (unlinkErr && unlinkErr.code !== 'ENOENT') console.error(`Error al borrar imagen ${absolutePath}:`, unlinkErr);
                  else if (!unlinkErr) console.log(`Imagen ${absolutePath} borrada.`);
             });
        }
        return true;
    } catch (error) {
         if (![400, 404].includes(error.statusCode)) {
             console.error(`Error en serviceService.deleteService (ID: ${id}):`, error);
         }
        throw error;
    }
};

const toggleServiceStatus = async (id, newStatus) => {
    if (typeof newStatus !== 'boolean') {
         const error = new Error("El estado debe ser true o false.");
         error.statusCode = 400;
         throw error;
    }

    const serviceId = parseInt(id, 10);
     if (isNaN(serviceId)) {
        const error = new Error("ID de servicio inválido.");
        error.statusCode = 400;
        throw error;
    }

    try {
        // Find unscoped first
        const service = await Service.unscoped().findByPk(serviceId);
        if (!service) {
            const error = new Error('Servicio no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        // Check if already in desired state
        if (service.status === newStatus) {
             console.log(`[ServiceService] Servicio ${serviceId} ya está en estado ${newStatus}.`);
             return service; // Return current state
        }

        // Update unscoped
        const [affectedRows] = await Service.unscoped().update(
             { status: newStatus },
             { where: { id: serviceId } }
        );

        if (affectedRows === 0) {
             console.warn(`[ServiceService] toggleServiceStatus para ID ${serviceId} no afectó filas.`);
             const error = new Error('Error al actualizar estado del servicio (0 filas afectadas).');
             error.statusCode = 500;
             throw error;
        }

        console.log(`[ServiceService] Servicio ${serviceId} status cambiado a ${newStatus}`);
        // Fetch again unscoped to return updated data
        return await Service.unscoped().findByPk(serviceId);

    } catch (error) {
         if (![400, 404, 500].includes(error.statusCode)) {
             console.error(`Error en serviceService.toggleServiceStatus (ID: ${id}):`, error);
         }
        throw error;
    }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus
};