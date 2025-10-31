const mongoose = require('mongoose');
const { Schema } = mongoose;

const SERVICE_TYPES = ['asistencia_diaria','acompanamiento','kinesiologia','enfermeria','otro'];

const CoberturaDiaSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },     // día calendario (00:00)
  cubierto: { type: Boolean, default: false },// true=pagado (verde), false=impago (rojo)
  nota: { type: String }                      // opcional
}, { _id: false });

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
  // ⬇️ Dias cubiertos
  coberturaDias: { type: [CoberturaDiaSchema], default: [] },
}, { timestamps: true });

ServicioSchema.index({ _id: 1, 'coberturaDias.fecha': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Servicio', ServicioSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;