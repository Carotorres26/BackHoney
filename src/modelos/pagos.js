const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Contract = require('./contract');
const Pago = sequelize.define('Pago', {
    id_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechaPago: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    metodoPago: {
        type: DataTypes.ENUM('efectivo', 'transferencia'),
        allowNull: false,
    },
    mesPago: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    contractId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Contract,
            key: 'id'
        }
    }
}, {
    tableName: 'pagos',
    timestamps: false
});

// Pago.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });

module.exports = Pago;