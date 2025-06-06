const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./client');

const Contract = sequelize.define('Contract', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fechaInicio: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
    },
    precioMensual: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    clientId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Client, key: 'id' }
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo' 
     }
}, {
    tableName: 'contracts',
    timestamps: true, 
});

// Contract.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

module.exports = Contract;