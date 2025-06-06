// src/modelos/Service.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'status'
  }

}, { 

  tableName: 'services',
  timestamps: false, 

  defaultScope: {
    where: { status: true }
  },
  scopes: {
    all: {},
    active: { where: { status: true } }, 
    inactive: { where: { status: false } }
  }
}); 

module.exports = Service;