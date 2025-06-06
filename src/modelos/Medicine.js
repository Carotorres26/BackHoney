// src/modelos/Medicine.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Specimen = require('./Specimen'); // Import the Specimen model

const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Set a default value if applicable
  },
  dosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  horaAdministracion: {
    type: DataTypes.TIME,  // Use TIME data type
    allowNull: false
  },
  estado:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Programado'

  },
  specimenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Specimen,
      key: 'id'
    }
  }
}, {
  tableName: 'medicines',
  timestamps: true, //  Consider using timestamps for tracking creation/updates
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      unique: true,
      fields: ['nombre', 'specimenId'] // Combinación única
    }
  ]

});

module.exports = Medicine;
