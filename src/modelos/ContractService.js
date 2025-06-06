const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContractService = sequelize.define('ContractService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'contractServices', 
    timestamps: false 
});

module.exports = ContractService;