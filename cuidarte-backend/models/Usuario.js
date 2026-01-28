// models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },

  password: { type: String, required: true },

  rol: {
    type: String,
    enum: ['admin', 'profesional', 'cliente'],
    default: 'cliente'
  },

  // 🔗 VINCULACIONES
  clienteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    default: null
  },

  profesionalRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesional',
    default: null
  },

  activo: { type: Boolean, default: true },

}, { timestamps: true });

// Hash password
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);

