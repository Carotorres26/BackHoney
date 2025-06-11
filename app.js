const express = require('express');
const app = express();
const cors = require('cors'); 
const path = require('path');
const { sequelize } = require('./src/config/database');

app.use(express.json());

const corsOptions = {
        origin: [
        'http://localhost:5173',          
        'https://hhoney-d7e51.web.app'     
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization", 
    optionsSuccessStatus: 200

};
app.use(cors(corsOptions)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dashboardRoutes = require('./src/rutas/dashboardRoutes');
const roleRoutes = require('./src/rutas/roleRoutes');
const permissionRoutes = require('./src/rutas/permissionRoutes');
const serviceRoutes = require('./src/rutas/serviceRoutes');
const categoryRoutes = require('./src/rutas/specimenCategoryRoutes');
const specimenRoutes = require('./src/rutas/specimenRoutes');
const authRoutes = require('./src/rutas/authRoutes'); // Importa el archivo renombrado (antes userRoutes.js)
const clientRoutes = require('./src/rutas/clientRoutes');
const contractRoutes = require('./src/rutas/contractRoutes');
const pagosRoutes = require('./src/rutas/pagosRoutes');
const sedeRouter = require('./src/rutas/sedeRoutes');
const medicineRoutes = require('./src/rutas/medicineRoutes');
const alimentacionRoutes = require('./src/rutas/AlimentacionRoutes'); 
const vacunacionRoutes = require('./src/rutas/VacunacionRoutes'); 
const userManagementRoutes = require('./src/rutas/userManagementRoutes');

const API_PREFIX = '/api'; 

app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/roles`, roleRoutes);
app.use(`${API_PREFIX}/clients`, clientRoutes);
app.use(`${API_PREFIX}/permissions`, permissionRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/specimen-categories`, categoryRoutes);
app.use(`${API_PREFIX}/specimens`, specimenRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/contracts`, contractRoutes);
app.use(`${API_PREFIX}/sedes`, sedeRouter);
app.use(`${API_PREFIX}/pagos`, pagosRoutes);
app.use(`${API_PREFIX}/medicines`, medicineRoutes);
app.use(`${API_PREFIX}/alimentaciones`, alimentacionRoutes); 
app.use(`${API_PREFIX}/vacunaciones`, vacunacionRoutes);
app.use(`${API_PREFIX}/users`, userManagementRoutes);

require('./src/modelos/associations');
const Role = require('./src/modelos/Role');
const Permission = require('./src/modelos/Permission');
const Service = require('./src/modelos/Service');
const SpecimenCategory = require('./src/modelos/SpecimenCategory');
const Specimen = require('./src/modelos/Specimen');
const User = require('./src/modelos/User');
const Client = require('./src/modelos/client');
const Contract = require('./src/modelos/contract');
const Payment = require('./src/modelos/pagos');
const Sede = require('./src/modelos/sede');
const Medicine = require('./src/modelos/Medicine');
const Alimentacion = require('./src/modelos/Alimentación');
const Vacunacion = require('./src/modelos/Vacunacion');


module.exports = app;

