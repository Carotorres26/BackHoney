// src/modelos/Permission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajusta la ruta

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { // Nombre único del permiso, ej: 'acceso_usuarios', 'crearRoles'
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
  // createdAt y updatedAt se añaden por defecto si timestamps: true (default)
}, {
  timestamps: true, // O false si no los necesitas para permisos
  tableName: 'Permissions' // Opcional: si el nombre de tu tabla es diferente
});

module.exports = Permission;