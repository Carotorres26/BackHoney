// src/repositorios/pagosRepository.js
const { Pago, Contract, Client, Specimen } = require('../modelos/associations'); // Ajusta la ruta si es necesario

// --- LISTAR TODOS LOS PAGOS (Ejemplo, ajusta según tus necesidades) ---
const getAllPagos = async () => {
    try {
        console.log("[PagosRepo] getAllPagos: Obteniendo todos los pagos...");
        const pagos = await Pago.findAll({
            attributes: [
                'id_pago', 'fechaPago', 'valor', 'metodoPago', 'mesPago', 'contractId'
            ],
            include: [
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['id', 'precioMensual', 'clientId'], // Campos básicos del contrato
                    include: [{
                        model: Client,
                        as: 'client',
                        attributes: ['id', 'nombre', 'documento'] // Campos básicos del cliente
                    }]
                }
            ],
            order: [['fechaPago', 'DESC'], ['id_pago', 'DESC']] // Ejemplo de orden
        });
        console.log(`[PagosRepo] getAllPagos: ${pagos.length} pagos encontrados.`);
        return pagos;
    } catch (error) {
        console.error("[PagosRepo] Error en getAllPagos:", error.message);
        throw new Error('Error al obtener la lista de pagos desde el repositorio');
    }
};

// --- OBTENER PAGO POR ID (Solución aplicada) ---
const getPagoById = async (id) => {
    try {
        console.log(`[PagosRepo] getPagoById: Buscando ID ${id}...`);
        const pago = await Pago.findByPk(id, {
            attributes: [
                'id_pago', 'fechaPago', 'valor', 'metodoPago', 'mesPago', 'contractId'
            ],
            include: [
                {
                    model: Contract,
                    as: 'contract',
                    attributes: [
                        'id', 'fechaInicio', 'precioMensual', 'clientId'
                    ],
                    include: [
                        {
                            model: Client,
                            as: 'client',
                            attributes: [
                                'id', 'nombre', 'documento', 'celular'
                                // Si 'correo' existe en tu BD y modelo Client.js y lo necesitas aquí, añádelo.
                                // 'correo'
                            ]
                        },
                        {
                            model: Specimen,
                            as: 'contractSpecimens',
                            attributes: [
                                'id', 'name', 'breed', 'color', 'birthDate', 'identifier', 'clientId'
                            ],
                            include: [
                                {
                                    model: Client,
                                    as: 'propietario',
                                    attributes: [
                                        'id', 'nombre', 'documento', 'celular'
                                        // Si 'correo' existe y lo necesitas para el propietario, añádelo.
                                        // 'correo'
                                    ]
                                }
                            ]
                        }
                        // Aquí podrías añadir la inclusión de 'servicios' si los necesitas para el detalle del pago
                        // {
                        //     model: Service, // Asumiendo que tienes un modelo Service
                        //     as: 'servicios', // Del Contract.belongsToMany(Service, { as: 'servicios', ... })
                        //     attributes: ['id', 'nombreServicio', 'descripcion'], // Los atributos que necesites de Service
                        //     through: { attributes: [] } // Para no traer los atributos de la tabla intermedia ContractService
                        // }
                    ]
                }
            ],
            // logging: sql => console.log("[PagosRepo] SQL getPagoById:", sql) // Descomenta para ver SQL
        });

        if (!pago) {
            console.warn(`[PagosRepo] Pago con ID ${id} no encontrado.`);
            throw new Error('Pago no encontrado');
        }
        console.log(`[PagosRepo] Pago encontrado ID ${id}.`);
        return pago;
    } catch (error) {
        console.error(`[PagosRepo] Error en getPagoById ID ${id}:`, error.name, error.message);
        if (error.original) {
            console.error(`[PagosRepo] Detalle del error original:`, error.original.sqlMessage || error.original);
        }
        if (error.sql) console.error(`[PagosRepo] SQL con error: ${error.sql}`);
        throw new Error('Error al obtener el pago desde el repositorio');
    }
};

// --- OBTENER PAGOS POR ID DE CONTRATO (Ejemplo) ---
const getPagosByContractId = async (contractId) => {
    try {
        console.log(`[PagosRepo] getPagosByContractId: Buscando pagos para contrato ID ${contractId}...`);
        const pagos = await Pago.findAll({
            where: { contractId: contractId },
            attributes: [
                'id_pago', 'fechaPago', 'valor', 'metodoPago', 'mesPago', 'contractId'
            ],
            include: [ // Podrías querer incluir menos detalles aquí que en getPagoById
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['id', 'precioMensual'],
                     include: [{
                        model: Client,
                        as: 'client',
                        attributes: ['id', 'nombre']
                    }]
                }
            ],
            order: [['mesPago', 'ASC']]
        });
        console.log(`[PagosRepo] getPagosByContractId: ${pagos.length} pagos encontrados para contrato ID ${contractId}.`);
        return pagos;
    } catch (error) {
        console.error(`[PagosRepo] Error en getPagosByContractId para contrato ID ${contractId}:`, error.message);
        throw new Error('Error al obtener pagos por contrato desde el repositorio');
    }
};

// --- CREAR PAGO ---
const createPago = async (pagoData) => {
    try {
        console.log("[PagosRepo] createPago: Creando nuevo pago con datos:", pagoData);
        const nuevoPago = await Pago.create(pagoData);
        console.log("[PagosRepo] createPago: Pago creado con ID:", nuevoPago.id_pago);
        // Para devolver el pago con sus asociaciones (si es necesario post-creación)
        return getPagoById(nuevoPago.id_pago);
    } catch (error) {
        console.error("[PagosRepo] Error en createPago:", error.message);
        // Manejo de errores específicos de Sequelize (ej. UniqueConstraintError)
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('Error de unicidad: Ya existe un registro con esos datos.');
        }
        throw new Error('Error al crear el pago en el repositorio');
    }
};

// --- ACTUALIZAR PAGO ---
const updatePago = async (id, pagoData) => {
    try {
        console.log(`[PagosRepo] updatePago: Actualizando pago ID ${id} con datos:`, pagoData);
        const pago = await Pago.findByPk(id);
        if (!pago) {
            console.warn(`[PagosRepo] updatePago: Pago con ID ${id} no encontrado para actualizar.`);
            throw new Error('Pago no encontrado para actualizar');
        }
        // El campo contractId no se debe actualizar aquí, ya fue filtrado en el servicio/controlador
        // o el frontend no lo envía para PUT.
        await pago.update(pagoData);
        console.log(`[PagosRepo] updatePago: Pago ID ${id} actualizado.`);
        // Para devolver el pago actualizado con sus asociaciones
        return getPagoById(id);
    } catch (error) {
        console.error(`[PagosRepo] Error en updatePago ID ${id}:`, error.message);
        throw new Error('Error al actualizar el pago en el repositorio');
    }
};


module.exports = {
    getAllPagos,
    getPagoById,
    getPagosByContractId,
    createPago,
    updatePago
    // Aquí irían tus otras funciones de repositorio si las tienes (ej. deletePago)
};