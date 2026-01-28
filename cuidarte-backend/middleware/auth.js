//cuidarte-backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Usuario.findById(payload.id);
    if (!user || !user.activo) {
      return res.status(401).json({ error: "No autenticado" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "No autenticado" });
  }
};