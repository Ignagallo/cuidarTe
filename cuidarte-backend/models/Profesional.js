// models/Profesional.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfesionalSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },

  nombreApellido: { type: String, required: true },
  dni:            { type: String, required: true, unique: true },
  telefono:       { type: String, required: true },
  fechaNacimiento:{ type: Date,   required: true },
  direccion:      { type: String, required: true },

  profesion:      { type: String, required: true },
  cbuCvu:         { type: String, required: true },
  fotoUrl:        { type: String },
  email:          { type: String, required: true },

  activo:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Profesional', ProfesionalSchema);
