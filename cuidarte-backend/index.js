// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cuidarte-nine.vercel.app",
      "https://cuidartelr.com.ar",
    ],
    credentials: true,
  })
);

// Middlewares base
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos
app.use("/uploads", express.static("uploads"));

// Rutas
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/profesionales", require("./routes/profesionales"));
app.use("/api/servicios", require("./routes/servicios"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/asignaciones", require("./routes/asignaciones"));
app.use("/api/tipos-servicio", require("./routes/tiposServicio"));
app.use("/api/agenda", require("./routes/agenda"));
app.use("/api/coberturas", require("./routes/coberturas"));

// Inicio del servidor
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log("✅ Conectado a MongoDB");
    console.log(
      "🔎 Base de datos:",
      mongoose.connection.name,
      "• Host:",
      mongoose.connection.host
    );

    // Crear admin si no existe
    const Usuario = require("./models/Usuario");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cuidarte.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const admin = await Usuario.findOne({ email: adminEmail });

    if (!admin) {
      await Usuario.create({
        nombre: "Admin",
        email: adminEmail,
        password: adminPassword,
        rol: "admin",
      });
      console.log("✅ Admin creado");
    } else if (admin.rol !== "admin") {
      admin.rol = "admin";
      await admin.save();
      console.log("🔧 Rol admin corregido");
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
      console.log(`🚀 API corriendo en puerto ${PORT}`)
    );
  } catch (e) {
    console.error("❌ Error al iniciar servidor:", e.message);
    process.exit(1);
  }
}

start();