// routes/usuarios.js
const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const jwt = require("jsonwebtoken");

router.get("/me", auth, (req, res) => {
  res.json({
    id: req.user._id,
    nombre: req.user.nombre,
    email: req.user.email,
    rol: req.user.rol,
  });
});

//LISTAR USUARIO
router.get("/", auth, requireRole("admin"), async (_req, res) => {
  console.log(">>> GET /api/usuarios EJECUTADO");
  const users = await Usuario.find()
    .select("-password") // nunca enviar password
    .sort({ createdAt: -1 });

  res.json(users);
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email, activo: true });
  if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await usuario.compararPassword(password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  });
});


// CREAR USUARIO
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    const nuevo = await Usuario.create({
      nombre,
      email,
      password,
      rol,
    });

    res.status(201).json({
      id: nuevo._id,
      nombre: nuevo.nombre,
      email: nuevo.email,
      rol: nuevo.rol,
      activo: nuevo.activo,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//EDITAR USUARIO
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.body;

    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (nombre !== undefined) user.nombre = nombre;
    if (email !== undefined) user.email = email;
    if (rol !== undefined) user.rol = rol;
    if (activo !== undefined) user.activo = activo;

    await user.save();

    res.json({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DESACTIVAR USUARIO
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  const user = await Usuario.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true },
  );

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ ok: true });
});
// Asignar usuario a cliente
router.post(
  "/:id/asignar-cliente",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { clienteId } = req.body;

      if (!clienteId) {
        return res.status(400).json({ error: "clienteId requerido" });
      }

      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (usuario.rol !== "cliente") {
        return res.status(400).json({
          error: "El usuario no tiene rol cliente",
        });
      }

      if (usuario.clienteRef) {
        return res.status(409).json({
          error: "El usuario ya tiene un cliente asignado",
        });
      }

      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      const yaAsignado = await Usuario.findOne({ clienteRef: clienteId });
      if (yaAsignado) {
        return res.status(409).json({
          error: "Ese cliente ya está asignado a otro usuario",
        });
      }

      usuario.clienteRef = cliente._id;
      await usuario.save();

      res.json({
        ok: true,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          rol: usuario.rol,
          clienteRef: usuario.clienteRef,
        },
      });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);
// Asignar usuario a profesional
router.post(
  "/:id/asignar-profesional",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { profesionalId } = req.body;

      if (!profesionalId) {
        return res.status(400).json({ error: "profesionalId requerido" });
      }

      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      if (usuario.rol !== "profesional") {
        return res.status(400).json({
          error: "El usuario no tiene rol profesional",
        });
      }

      if (usuario.profesionalRef) {
        return res.status(409).json({
          error: "El usuario ya tiene un profesional asignado",
        });
      }

      const profesional = await Profesional.findById(profesionalId);
      if (!profesional) {
        return res.status(404).json({ error: "Profesional no encontrado" });
      }

      const yaAsignado = await Usuario.findOne({
        profesionalRef: profesionalId,
      });
      if (yaAsignado) {
        return res.status(409).json({
          error: "Ese profesional ya está asignado a otro usuario",
        });
      }

      usuario.profesionalRef = profesional._id;
      await usuario.save();

      res.json({
        ok: true,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          rol: usuario.rol,
          profesionalRef: usuario.profesionalRef,
        },
      });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// LOGOUT
router.post("/logout", auth, (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

module.exports = router;
