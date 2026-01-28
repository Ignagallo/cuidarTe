// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.set("trust proxy", 1);

// Middlewares
// Lee orígenes permitidos desde ENV (coma-separados) o usa defaults
const ORIGINS = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,https://cuidarte-nine.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Helper para CORS dinámico
const corsOptions = {
  origin: (origin, cb) => {
    // Permite requests de herramientas sin origin (curl / Postman) y los que estén en la lista
    if (!origin || ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS bloqueado para origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware extra para que el preflight siempre pase y no quede cacheado con otro Origin
app.use((req, res, next) => {
  const origin = ORIGINS.includes(req.headers.origin)
    ? req.headers.origin
    : ORIGINS[0];
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos desde /uploads
app.use("/uploads", express.static("uploads"));

// Rutas
const usuariosRoutes = require("./routes/usuarios");
const clientesRoutes = require("./routes/clientes");
const profesionalesRoutes = require("./routes/profesionales");
const serviciosRoutes = require("./routes/servicios");
const uploadRoutes = require("./routes/upload");
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/asignaciones", require("./routes/asignaciones"));
app.use("/api/tipos-servicio", require("./routes/tiposServicio"));

// Función principal
async function start() {
  try {
    // Conexión a MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("✅ Conectado a MongoDB");
    console.log(
      "🔎 Base de datos:",
      mongoose.connection.name,
      " • Host:",
      mongoose.connection.host,
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

    // Levantar servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
  } catch (e) {
    console.error("❌ Error al iniciar servidor:", e.message);
    process.exit(1);
  }
}

start();
