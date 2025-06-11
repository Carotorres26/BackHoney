const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const SpecimenCategory = require('./SpecimenCategory');
const Sede = require('./sede');
const Client = require('./client'); 
const { v4: uuidv4 } = require('uuid');

const Specimen = sequelize.define('Specimen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    breed: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    clientId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'id'
        }
    },
    specimenCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SpecimenCategory,
            key: 'id'
        }
    },
    identifier: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    },
    sedeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Sede,
            key: 'id'
        }
    },
    contractId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'contracts', 
            key: 'id'
        }
    }
}, {
    timestamps: false,
    
    hooks: {
        afterCreate: async (specimen, options) => {
            try {
                if (specimen.clientId) {
                    await Client.increment('ejemplares', {
                        by: 1,
                        where: { id: specimen.clientId },
                        transaction: options.transaction
                    });
                    console.log(`Hook afterCreate Specimen: Incrementado contador para Client ID ${specimen.clientId}`);
                }
            } catch (error) {
                console.error(`Error en hook afterCreate para Specimen ID ${specimen.id}:`, error);
                // Considera lanzar el error si quieres que falle la transacción
                // throw new Error('Fallo al actualizar contador de cliente tras crear ejemplar.');
            }
        },

        afterDestroy: async (specimen, options) => {
            try {
                // Usamos _previousDataValues porque el 'specimen' podría ya no tener el clientId tras el borrado en algunos casos
                const clientId = specimen.clientId || (specimen._previousDataValues && specimen._previousDataValues.clientId);
                if (clientId) {
                    await Client.decrement('ejemplares', {
                        by: 1,
                        where: { id: clientId },
                        transaction: options.transaction
                    });
                    console.log(`Hook afterDestroy Specimen: Decrementado contador para Client ID ${clientId}`);
                } else {
                     console.warn(`Hook afterDestroy Specimen: No se pudo obtener clientId para Specimen ID ${specimen.id}. No se decrementó contador.`);
                }
            } catch (error) {
                console.error(`Error en hook afterDestroy para Specimen ID ${specimen.id}:`, error);
                // throw new Error('Fallo al actualizar contador de cliente tras eliminar ejemplar.');
            }
        },

        afterUpdate: async (specimen, options) => {
            if (specimen.changed('clientId')) {
                console.log(`Hook afterUpdate Specimen: clientId cambió para Specimen ID ${specimen.id}`);
                const previousClientId = specimen.previous('clientId');
                const currentClientId = specimen.clientId;
                const updates = [];

                if (previousClientId) {
                    console.log(` - Decrementando contador para cliente anterior ID: ${previousClientId}`);
                    updates.push(
                        Client.decrement('ejemplares', {
                            by: 1,
                            where: { id: previousClientId },
                            transaction: options.transaction
                        })
                    );
                }

                if (currentClientId) {
                    console.log(` - Incrementando contador para cliente nuevo ID: ${currentClientId}`);
                    updates.push(
                        Client.increment('ejemplares', {
                            by: 1,
                            where: { id: currentClientId },
                            transaction: options.transaction
                        })
                    );
                }

                try {
                    await Promise.all(updates);
                    console.log(`Hook afterUpdate Specimen: Contadores de clientes actualizados.`);
                } catch (error) {
                    console.error(`Error en hook afterUpdate Specimen ID ${specimen.id} al actualizar contadores:`, error);
                    // throw new Error('Fallo al actualizar contadores de clientes tras cambiar dueño.');
                }
            }
        }
    }
});

module.exports = Specimen;