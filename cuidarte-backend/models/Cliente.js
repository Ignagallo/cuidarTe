// models/Cliente.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const ClienteSchema = new mongoose.Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  nombreApellido: { type: String, required: true },
  email:          { type: String, required: true, lowercase: true, trim: true  },
  direccion:      { type: String, required: true },
  dni:            { type: String, required: true, unique: true },
  fechaNacimiento:{ type: Date,   required: true },
  telefono:       { type: String, required: true },
  activo:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);