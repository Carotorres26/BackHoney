// src/modelos/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Asegúrate que la ruta sea correcta
const Role = require('./Role'); // Asegúrate que la ruta sea correcta

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombreCompleto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser opcional
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role, // Referencia al modelo Role
            key: 'id'
        }
    },
    status: { // 'activo' o 'inactivo'
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Los usuarios se crean activos por defecto
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    timestamps: true, // Habilitar createdAt y updatedAt
    // paranoid: true, // Descomentar para borrado lógico (añade deletedAt)
    // defaultScope: { // Si quisieras filtrar por defecto usuarios activos
    //    where: { status: true }
    // },
    // scopes: { // Para definir otros scopes reutilizables
    //    all: {}, // Un scope vacío anula el defaultScope si se usa User.scope('all')
    //    active: { where: { status: true }},
    //    inactive: { where: { status: false }}
    // }
});
User.prototype.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;