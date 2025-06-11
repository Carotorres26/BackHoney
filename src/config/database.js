// src/config/database.js - ¡NUEVA VERSIÓN!
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegúrate de tener dotenv instalado para leer .env

// 1. Define la configuración en un objeto
const config = {
  development: {
    url: process.env.MYSQL_URL || "mysql://root:GzcxBKOlILnTuoonzjgCdGlxfqAZDWzT@centerbeam.proxy.rlwy.net:41836/railway",
    dialect: 'mysql',
    logging: false
  },
  test: {
    // Configuración para la base de datos de pruebas (puedes llenarla después)
    url: process.env.TEST_DB_URL,
    dialect: 'mysql'
  },
  production: {
    // Configuración para la base de datos de producción
    url: process.env.MYSQL_URL, // Usualmente la misma que development si usas Railway/variables de entorno
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Puede ser necesario para algunas nubes
      }
    }
  }
};

// 2. Crea la instancia de Sequelize usando la configuración
// Determina qué entorno usar (development por defecto)
const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env].url, config[env]);

// 3. Exporta AMBAS cosas: la configuración para la CLI y la instancia para tu app
module.exports = {
  ...config,      // Exporta development, test, production para que la CLI los vea
  sequelize       // Exporta la instancia para que tu app la use como antes
};