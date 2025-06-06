// src/modelos/Alimentacion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Specimen = require('./Specimen'); // Importamos Specimen para la relación

const Alimentacion = sequelize.define('Alimentacion', {
  // --- Columnas ---
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreAlimento: {
    type: DataTypes.STRING,
    allowNull: false
    // SIN unique: true aquí
  },
  cantidad: {
    type: DataTypes.INTEGER, // O DataTypes.FLOAT si puede ser decimal
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
  // --- Opciones del Modelo ---
  tableName: 'alimentaciones',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',

  // --- Índice Único Compuesto --- <<<--- AQUÍ VA
  indexes: [
    {
      unique: true,                      // La combinación debe ser única
      fields: ['nombreAlimento', 'specimenId'] // En estas dos columnas
    }
  ]
  // --- ------------------------ ---

});

// Método associate (la definición real está en associations.js)
Alimentacion.associate = (models) => {
  // Ejemplo: Alimentacion.belongsTo(models.Specimen, { foreignKey: 'specimenId', as: 'specimen' });
};

module.exports = Alimentacion;
