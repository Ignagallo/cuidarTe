// models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');           // hasheo del password

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true},
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true},
  rol: { type: String, enum: ['admin', 'profesional', 'cliente'], default: 'admin'},
  activo: { type: Boolean, default: true},
  creadoEn: { type: Date, default: Date.now}
});

// 🔐 Hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next(); // Si no se modificó, no volver a hashear
    const salt = await bcrypt.genSalt(10); // Genera un salt de 10 rondas
    this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseña en login
usuarioSchema.methods.compararPassword = function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
