// models/Usuario.js
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../utils/password");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: { type: String, required: true },

    rol: {
      type: String,
      enum: ["superadmin", "admin", "profesional", "cliente"],
      default: "cliente",
    },

    // 🔗 VINCULACIONES
    clienteRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      default: null,
    },

    profesionalRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profesional",
      default: null,
    },

    activo: { type: Boolean, default: true },

    tokenVersion: { type: Number, default: 0 },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },

    requiereCambioPassword: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Hash password
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

usuarioSchema.methods.compararPassword = function (password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
