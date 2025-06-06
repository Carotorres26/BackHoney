// Server.js (Archivo principal que ejecutas con node)

// --- ¡¡CARGAR DOTENV PRIMERO QUE NADA!! ---
require('dotenv').config();
// -----------------------------------------

// Ahora puedes requerir otros módulos que puedan usar process.env
const http = require('http'); // O https si usas SSL
const app = require('./app'); // Requiere tu configuración de Express desde app.js
const sequelize = require('./src/config/database'); // Asegúrate que la ruta a tu config de DB sea correcta

// Verifica INMEDIATAMENTE si la variable se cargó
console.log("Verificando JWT_SECRET después de dotenv.config:", process.env.JWT_SECRET ? 'CARGADA' : 'NO CARGADA - ¡Revisa .env y ubicación de dotenv.config!');
if (!process.env.JWT_SECRET) {
    console.error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no se pudo cargar. Asegúrate que .env existe y dotenv.config() se ejecuta primero.");
    process.exit(1); // Detiene la aplicación si falta el secreto
}

const PORT = process.env.PORT || 3000;

// Crea el servidor HTTP usando la app Express configurada
const server = http.createServer(app);

// Sincroniza la base de datos y luego inicia el servidor
sequelize.sync({ force: false }) // force: false para producción/desarrollo normal. force: true borrará y recreará tablas.
  .then(() => {
    // Considera si este log es necesario o si es de una configuración anterior
    // console.log('Base de datos sincronizada con alter:true.'); // Si ya no usas alter:true, puedes quitarlo
    console.log('Base de datos sincronizada.');
    
    // Inicia el servidor escuchando en el puerto especificado Y en todas las interfaces de red
    server.listen(PORT, '0.0.0.0', () => { 
      console.log(`Server running on port ${PORT} and listening on all interfaces (0.0.0.0)`);
      console.log(`Backend accesible para emulador Android en: http://10.0.2.2:${PORT}`);
      // Para dispositivos en la misma red, necesitarías encontrar la IP local de tu máquina, ej: http://192.168.1.X:${PORT}
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos o al iniciar el servidor:', err);
    process.exit(1); // Detiene la aplicación en caso de error crítico de DB/inicio
  });