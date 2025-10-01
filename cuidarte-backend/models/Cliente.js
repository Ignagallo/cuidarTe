const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
  nombreApellido: { type: String, required: true },
  email:          { type: String, required: true },
  direccion:      { type: String, required: true },
  dni:            { type: String, required: true, unique: true },
  fechaNacimiento:{ type: Date,   required: true },
  telefono:       { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Cliente', ClienteSchema);