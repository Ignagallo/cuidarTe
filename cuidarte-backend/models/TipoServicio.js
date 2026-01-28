// models/TipoServicio.js
const mongoose = require("mongoose");

const TipoServicioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TipoServicio", TipoServicioSchema);
