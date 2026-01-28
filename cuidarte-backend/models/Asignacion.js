const mongoose = require("mongoose");
const { Schema } = mongoose;

const AsignacionSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    profesional: {
      type: Schema.Types.ObjectId,
      ref: "Profesional",
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    desde: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Evita duplicados activos
AsignacionSchema.index(
  { cliente: 1, profesional: 1 },
  { unique: true }
);

module.exports = mongoose.model("Asignacion", AsignacionSchema);
