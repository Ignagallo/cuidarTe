// models/Servicio.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServicioSchema = new Schema({
  tipoServicio: {
    type: Schema.Types.ObjectId,
    ref: 'TipoServicio',
    required: true
  },

  estado: {
    type: String,
    enum: ['activo', 'pausado', 'finalizado', 'cancelado'],
    default: 'activo'
  },

  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date }, // opcional (servicio indefinido)

  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },

  diasSemana: {
    type: [Number],
    required: true,
    validate: v => v.every(d => d >= 0 && d <= 6)
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },

  profesional: {
    type: Schema.Types.ObjectId,
    ref: 'Profesional',
    required: true
  },

  indicaciones: { type: String },

  observacionesInternas: { type: String },

  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }

}, { timestamps: true });

module.exports = mongoose.model('Servicio', ServicioSchema);

