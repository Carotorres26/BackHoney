// src/modelos/Client.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
// No necesitas importar Specimen aquí si la asociación se define en associations.js

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: { // Asegúrate que este sea el nombre correcto, antes era nombreCompleto
        type: DataTypes.STRING,
        allowNull: false,
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // Cambiado 'correo' a 'email' para consistencia (opcional, pero común)
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    ejemplares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // <-- CORRECCIÓN: Añadido valor por defecto
        comment: 'Número de ejemplares asociados a este cliente'
    },
}, {
    tableName: 'clients', // Nombre de la tabla explícito
    timestamps: true, // <-- RECOMENDADO: Cambiado a true para que .changed() funcione bien
});

module.exports = Client;