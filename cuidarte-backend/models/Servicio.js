// models/Servicio.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SERVICE_TYPES = [
  'asistencia_diaria',
  'acompanamiento',
  'kinesiologia',
  'enfermeria',
  'otro'
];

const CoberturaDiaSchema = new Schema({
  fecha:    { type: Date, required: true },   // día calendario
  cubierto: { type: Boolean, default: false },// pagado / impago
  nota:     { type: String }
}, { _id: false });

const ServicioSchema = new Schema({
  tipo:        { type: String, enum: SERVICE_TYPES, default: 'asistencia_diaria' },

  estado: {
    type: String,
    enum: ['activo', 'pausado', 'finalizado', 'cancelado'],
    default: 'activo'
  },

  fechaInicio: { type: Date, required: true },
  fechaFin:    { type: Date, required: true },

  horaInicio:  { type: String, required: true }, // "08:00"
  horaFin:     { type: String, required: true }, // "12:00"

  diasSemana: {
    type: [Number],
    required: true,
    validate: v => v.every(d => d >= 0 && d <= 6)
  },

  cliente:     { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  profesional: { type: Schema.Types.ObjectId, ref: 'Profesional', required: true },

  indicaciones:{ type: String },

  coberturaDias: { type: [CoberturaDiaSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Servicio', ServicioSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;
