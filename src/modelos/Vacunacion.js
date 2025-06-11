// src/modelos/Vacunacion.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Specimen = require('./Specimen'); // Importamos Specimen para la relación

const Vacunacion = sequelize.define('Vacunacion', {
  // --- Columnas ---
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreVacuna: {
    type: DataTypes.STRING,
    allowNull: false
    // SIN unique: true aquí
  },
  fechaAdministracion: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY si solo necesitas la fecha (sin hora)
    // type: DataTypes.DATE, // Usa DATE si necesitas fecha Y hora
    allowNull: false
  },
  specimenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Specimen, // Referencia al modelo Specimen importado
      key: 'id'       // La clave primaria del modelo Specimen
    }
  }
}, {
  // --- Opciones del Modelo ---
  tableName: 'vacunaciones', // Nombre explícito de la tabla (plural)
  timestamps: true,          // Añade createdAt y updatedAt automáticamente
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',

  // --- Índice Único Compuesto --- <<<--- AQUÍ VA
  indexes: [
    {
      unique: true,                      // La combinación debe ser única
      fields: ['nombreVacuna', 'specimenId'] // En estas dos columnas
    }
  ]
  // --- ------------------------ ---
});

// Método associate (la definición real está en associations.js)
Vacunacion.associate = (models) => {
  // Ejemplo: Vacunacion.belongsTo(models.Specimen, { foreignKey: 'specimenId', as: 'specimen' });
};

module.exports = Vacunacion;