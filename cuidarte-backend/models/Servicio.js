const mongoose = require('mongoose');
const { Schema } = mongoose;

const SERVICE_TYPES = ['asistencia_diaria','acompanamiento','kinesiologia','enfermeria','otro'];

const ServicioSchema = new Schema({
  tipo:        { type: String, enum: SERVICE_TYPES, default: 'asistencia_diaria' },
  fechaInicio: { type: Date, required: true },
  fechaFin:    { type: Date, required: true },
  horaInicio:  { type: String, required: true }, // "08:00"
  horaFin:     { type: String, required: true }, // "12:00"
  diasSemana:  { type: [Number], required: true, validate: v => v.every(d => d>=0 && d<=6) },
  cliente:     { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  profesional: { type: Schema.Types.ObjectId, ref: 'Profesional', required: true },
  indicaciones:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Servicio', ServicioSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;