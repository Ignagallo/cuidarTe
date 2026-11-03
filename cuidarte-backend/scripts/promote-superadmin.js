require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline/promises");
const Usuario = require("../models/Usuario");

async function promoteSuperadmin({ email, UsuarioModel, confirmPromotion }) {
  const existingSuperadmin = await UsuarioModel.exists({ rol: "superadmin", activo: true });
  if (existingSuperadmin) {
    throw new Error("Ya existe un superadmin activo; la promoción inicial ya fue utilizada.");
  }

  const usuario = await UsuarioModel.findOne({ email });
  if (!usuario || usuario.rol !== "admin" || !usuario.activo) {
    throw new Error("El email debe pertenecer a un usuario admin existente y activo.");
  }

  const confirmation = await confirmPromotion();
  if (confirmation !== "PROMOVER") {
    throw new Error("Promoción cancelada.");
  }

  usuario.rol = "superadmin";
  usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
  await usuario.save();
  return usuario;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !process.env.MONGO_URI) {
    throw new Error("Uso: node scripts/promote-superadmin.js correo@dominio.com (requiere MONGO_URI)");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    ...(process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {}),
  });

  await promoteSuperadmin({
    email,
    UsuarioModel: Usuario,
    confirmPromotion: async () => {
      const input = readline.createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await input.question(`Para promover ${email}, escribí PROMOVER: `);
      } finally {
        input.close();
      }
    },
  });
  process.stdout.write(`Rol superadmin asignado a ${email}.\n`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    });
}

module.exports = { promoteSuperadmin };
