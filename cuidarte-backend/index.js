// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos desde /uploads
app.use('/uploads', express.static('uploads'));

// Rutas
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const profesionalesRoutes = require('./routes/profesionales');
const serviciosRoutes = require('./routes/servicios');
const uploadRoutes = require('./routes/upload');
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/upload', uploadRoutes);

// Función principal
async function start() {
  try {
    // Conexión a MongoDB
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME });
    console.log('✅ Conectado a MongoDB');
    console.log('🔎 Base de datos:', mongoose.connection.name, ' • Host:', mongoose.connection.host);

    // Crear admin si no existe
    const Usuario = require('./models/Usuario');
    const admins = await Usuario.countDocuments({ rol: 'admin' });
    console.log('🔎 Admins encontrados:', admins);

    if (admins === 0) {
      const nombre   = process.env.ADMIN_NAME     || 'Admin';
      const email    = process.env.ADMIN_EMAIL    || 'admin@cuidarte.com';
      const password = process.env.ADMIN_PASSWORD || 'admin123';

      await Usuario.create({ nombre, email, password, rol: 'admin' });
      console.log(`✅ Admin creado (${email})`);
    } else {
      console.log('ℹ️ Ya existe al menos un admin, no se crea otro.');
    }

    // Levantar servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Error al iniciar servidor:', e.message);
    process.exit(1);
  }
}

start();
