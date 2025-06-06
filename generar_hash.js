const bcrypt = require('bcrypt');
const contraseña = 'disley123*';
const saltRounds = 10;

bcrypt.hash(contraseña, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('Nuevo hash:', hash);
});
