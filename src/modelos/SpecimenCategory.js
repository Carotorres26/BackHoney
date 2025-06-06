// src/modelos/SpecimenCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate que la ruta es correcta

const SpecimenCategory = sequelize.define('SpecimenCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // --- CORREGIDO para coincidir con la DB ---
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'), // Tipo ENUM
    allowNull: false,
    defaultValue: 'activo' // Default ENUM
  }
  // --- FIN CORRECCIÓN ---
}, {
  timestamps: false, // O false si no las usas
  tableName: 'specimenCategories', // Verifica que este sea el nombre exacto de tu tabla

  // --- CORREGIDO para usar 'estado' ---
  defaultScope: {
    where: { estado: 'activo' }
  },
  scopes: {
    all: {},
    active: { where: { estado: 'activo' } },
    inactive: { where: { estado: 'inactivo' } }
  }
  // --- FIN CORRECCIÓN ---
});

module.exports = SpecimenCategory;