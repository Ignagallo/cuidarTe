// models/TipoServicio.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TipoServicioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    descripcion: {
      type: String,
    },

    activo: {
      type: Boolean,
      default: true,
    },

    color: {
      type: String, // para agenda futura (#hex)
      default: "#1D4A74",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TipoServicio", TipoServicioSchema);

