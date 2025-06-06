const Service = require('../modelos/Service');

const createService = async (service) => {
  return Service.create(service);
};

const getAllServices = async () => {
  return Service.findAll();
};

const getServiceById = async (id) => {
  return Service.findByPk(id);
};

const updateService = async (id, service) => {
  return Service.update(service, { where: { id } });
};

const deleteService = async (id) => {
  return Service.destroy({ where: { id } });
};

module.exports = {
  createService,
  getAllServices, 
  getServiceById,
  updateService,
  deleteService
};