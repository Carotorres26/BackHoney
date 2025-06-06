// src/middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // *** CAMBIO AQUÍ: Apunta solo a 'uploads/' ***
    cb(null, 'uploads/'); // Guarda directamente en la carpeta 'uploads'
  },
  filename: function (req, file, cb) {
    // Mantenemos la generación de nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Puedes decidir si quieres prefijar con 'imagen-' o no
    cb(null, 'imagen-' + uniqueSuffix + path.extname(file.originalname));
    // O simplemente: cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos (sin cambios)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Puedes personalizar el mensaje o usar uno más genérico
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes.'), false);
  }
};

// Crear la instancia de multer (sin cambios)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5MB
    }
});

// Exportar middleware (sin cambios, sigue usando 'imagen')
module.exports = upload.single('imagen');