// verificar_hash.js
const bcrypt = require('bcrypt');

// --- MODIFICA ESTAS DOS LÍNEAS ---
const miContrasenaPlana = 'disley123*'; // <-- PON AQUÍ LA CONTRASEÑA que estás intentando usar en el login
const hashDeLaBaseDeDatos = '$$2b$10$5CQsBiI68l.h0s2G82MjD.MDLWQpOLzJ0MYbuEKFErfwic51Mrt46';   // <-- PEGA AQUÍ el hash de la BD (ej: '$2b$10$D3olbqfuPfHq5KQ5IVZ51O...')
// ---------------------------------

console.log("Comparando contraseña:", miContrasenaPlana);
console.log("Contra el hash:", hashDeLaBaseDeDatos);

bcrypt.compare(miContrasenaPlana, hashDeLaBaseDeDatos)
  .then(coinciden => {
    console.log('\n¿Las contraseñas coinciden?:', coinciden);
    if (!coinciden) {
         console.log('*** ¡ATENCIÓN! El hash en la BD NO corresponde a esta contraseña plana. ***');
         console.log('*** Verifica la contraseña plana o el hash almacenado. ***');
    } else {
         console.log('*** ¡ÉXITO! El hash corresponde a la contraseña proporcionada. ***');
         console.log('*** Si el login sigue fallando, el problema podría ser el username o el estado "status". ***');
    }
  })
  .catch(err => console.error('Error durante la comparación:', err));