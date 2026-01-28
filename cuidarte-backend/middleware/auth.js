//cuidarte-backend/middleware/auth.js
console.log('🔥 AUTH MIDDLEWARE CARGADO');

const Usuario = require('../models/Usuario');

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await Usuario.findById(token);

    if (!user || !user.activo) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    req.user = user; // 🔒 GARANTÍA
    next();
  } catch (e) {
    console.error('AUTH ERROR:', e);
    return res.status(401).json({ error: 'No autenticado' });
  }
  console.log('🔥 AUTH EJECUTADO, token:', req.cookies?.token);
};
