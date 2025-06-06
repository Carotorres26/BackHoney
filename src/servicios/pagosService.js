const pagosRepository = require('../repositorios/pagosRepository');
const pagos = require('../modelos/pagos');

const listPagos = async () => {
    try { return await pagosRepository.getAllPagos(); }
    catch (error) { console.error("[PagosService] Error en listPagos:", error); throw new Error('Error al obtener los pagos'); }
};

const getPagoById = async (id) => {
    try {
        const pago = await pagosRepository.getPagoById(id);
        // El repositorio ya lanza error si no lo encuentra por ID
        // if (!pago) throw new Error('Pago no encontrado');
        return pago;
    } catch (error) { console.error(`[PagosService] Error en getPagoById ${id}:`, error); throw new Error(`Error al obtener el pago: ${error.message}`); }
};

const getPagosByContractId = async (contractId) => {
    try { return await pagosRepository.getPagosByContractId(contractId); }
    catch (error) { console.error(`[PagosService] Error en getPagosByContractId ${contractId}:`, error); throw new Error('Error al obtener los pagos del contrato'); }
};

const createPago = async (pagoData) => {
    // Podrías añadir validaciones de lógica de negocio aquí si es necesario
    try { return await pagosRepository.createPago(pagoData); }
    catch (error) { console.error("[PagosService] Error en createPago:", error); throw new Error(`Error al agregar el pago: ${error.message}`); }
};

const updatePago = async (id, pagoData) => {
    // Podrías añadir validaciones de lógica de negocio aquí
    try { return await pagosRepository.updatePago(id, pagoData); }
    catch (error) { console.error(`[PagosService] Error en updatePago ${id}:`, error); throw new Error(`Error al actualizar el pago: ${error.message}`); }
};


module.exports = {
    listPagos,
    getPagoById,
    getPagosByContractId,
    createPago,
    updatePago
};