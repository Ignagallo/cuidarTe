require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline/promises");
const Usuario = require("../models/Usuario");

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !process.env.MONGO_URI) {
    throw new Error("Uso: node scripts/promote-superadmin.js correo@dominio.com (requiere MONGO_URI)");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    ...(process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {}),
  });

  const existingSuperadmin = await Usuario.exists({ rol: "superadmin" });
  if (existingSuperadmin) {
    throw new Error("Ya existe un superadmin; la promoción inicial ya fue utilizada.");
  }

  const usuario = await Usuario.findOne({ email });
  if (!usuario || usuario.rol !== "admin" || !usuario.activo) {
    throw new Error("El email debe pertenecer a un usuario admin existente y activo.");
  }

  const input = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const confirmation = await input.question(`Para promover ${email}, escribí PROMOVER: `);
    if (confirmation !== "PROMOVER") {
      throw new Error("Promoción cancelada.");
    }
  } finally {
    input.close();
  }

  usuario.rol = "superadmin";
  usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
  await usuario.save();
  process.stdout.write(`Rol superadmin asignado a ${email}.\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
