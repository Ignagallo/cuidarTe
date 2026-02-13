const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema(
  {
    monto: {
      type: Number,
      required: true,
      min: 0,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    nota: {
      type: String,
      trim: true,
    },

    // 👇 auditoría
    editadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    editadoEn: Date,
    anulado: {
      type: Boolean,
      default: false,
    },
    anuladoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    anuladoEn: Date,
  },
  { _id: true },
);

const CoberturaSchema = new mongoose.Schema(
  {
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      required: true,
      unique: true, // una cobertura por servicio
    },

    totalServicio: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPagado: {
      type: Number,
      default: 0,
      min: 0,
    },

    estado: {
      type: String,
      enum: ["impago", "parcial", "pago"],
      default: "impago",
      index: true,
    },

    pagos: [PagoSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cobertura", CoberturaSchema);
