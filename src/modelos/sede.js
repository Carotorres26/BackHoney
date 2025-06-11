const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sede = sequelize.define('Sede', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    NombreSede: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isUnique: async (value) => {
                const sede = await Sede.findOne({
                    where: { NombreSede: value }
                });
                if (sede) {
                    throw new Error('Ya existe una sede con este nombre.');
                }
            },
            len: {
                args: [3], // Minimo 3 caracteres
                msg: 'El nombre de la sede debe tener al menos 3 caracteres.'
            }
        }
    }
}, { 
    timestamps: false,
    tableName: 'Sedes' 
});

module.exports = Sede;