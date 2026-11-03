// routes/usuarios.js
const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Cobertura = require("../models/Cobertura");
const Servicio = require("../models/Servicio");
const isTokenVersionCurrent = require("../utils/isTokenVersionCurrent");
const isLastActiveSuperadmin = require("../utils/isLastActiveSuperadmin");
const { validatePassword } = require("../utils/password");
const { createPasswordRecoveryHandlers } = require("../utils/passwordRecoveryHandlers");

const passwordRecoveryHandlers = createPasswordRecoveryHandlers({
  users: {
    findActiveByEmail: (email) => Usuario.findOne({ email, activo: true }),
    storeResetToken: async (user, tokenHash, expiresAt) => {
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = expiresAt;
      await user.save();
    },
    clearResetToken: (userId, tokenHash) => Usuario.updateOne(
      { _id: userId, passwordResetTokenHash: tokenHash },
      { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } },
    ),
    consumeResetToken: (tokenHash, passwordHash, now) => Usuario.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: now },
        activo: true,
      },
      {
        $set: { password: passwordHash, requiereCambioPassword: false },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
        $inc: { tokenVersion: 1 },
      },
      { new: true, runValidators: true },
    ),
  },
  emailConfigured: false,
});

router.post("/forgot-password", passwordRecoveryHandlers.requestReset);
router.post("/reset-password", passwordRecoveryHandlers.resetPassword);

//----------------------- AUTH / SESION -------------------
// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email, activo: true });
  if (!usuario)
    return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await usuario.compararPassword(password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol, tokenVersion: usuario.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
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
    requiereCambioPassword: usuario.requiereCambioPassword,
  });
});
// LOGOUT
router.post("/logout", async (_req, res) => {
  const token = _req.cookies?.token;
  if (token) {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_error) {
      // Invalid or expired cookies can still be cleared.
    }
    if (payload) {
      try {
      const usuario = await Usuario.findById(payload.id);
      if (usuario && isTokenVersionCurrent(payload.tokenVersion, usuario.tokenVersion)) {
        usuario.tokenVersion = (usuario.tokenVersion ?? 0) + 1;
        await usuario.save();
      }
      } catch (_error) {
        return res.status(500).json({ error: "No se pudo invalidar la sesión" });
      }
    }
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ ok: true });
});
// ADMIN
router.get("/me", auth, (req, res) => {
  res.json({
    id: req.user._id,
    nombre: req.user.nombre,
    email: req.user.email,
    rol: req.user.rol,
  });
});

//------------- SESION CLIENTE / PROFESIONAL---------------
// CAMBIAR PASSWORD (usuario logueado)
router.put("/cambiar-password", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await Usuario.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.password = password;
    user.requiereCambioPassword = false;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//-------------------- PANEL ADMIN -------------------------
//LISTAR USUARIO
router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const users = await Usuario.find()
    .select("-password") // nunca enviar password
    .sort({ createdAt: -1 });
  res.json(users);
});
// CREAR USUARIO
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const allowedRoles = req.user.rol === "superadmin"
      ? Usuario.schema.path("rol").enumValues
      : ["profesional", "cliente"];
    if (!allowedRoles.includes(rol)) {
      return res.status(403).json({ error: "No autorizado para asignar ese rol" });
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
    const previousRole = user.rol;
    const previousActive = user.activo;
    if (user.rol === "superadmin" && req.user.rol !== "superadmin") {
      return res.status(403).json({ error: "Solo un superadmin puede modificar otra cuenta superadmin" });
    }
    if (req.user.rol !== "superadmin" && user.rol === "admin" &&
        ((rol !== undefined && rol !== user.rol) ||
         (activo !== undefined && activo !== user.activo))) {
      return res.status(403).json({ error: "Solo un superadmin puede cambiar el rol o estado de una cuenta administrativa" });
    }

    const allowedRoles = req.user.rol === "superadmin"
      ? Usuario.schema.path("rol").enumValues
      : ["profesional", "cliente"];
    if (rol !== undefined && !Usuario.schema.path("rol").enumValues.includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }
    if (rol !== undefined && rol !== user.rol && !allowedRoles.includes(rol)) {
      return res.status(403).json({ error: "No autorizado para asignar ese rol" });
    }
    const isLosingSuperadmin = user.rol === "superadmin" &&
      ((rol !== undefined && rol !== "superadmin") || activo === false);
    if (isLosingSuperadmin && isLastActiveSuperadmin(
      user,
      await Usuario.countDocuments({ rol: "superadmin", activo: true }),
    )) {
      return res.status(409).json({ error: "No se puede degradar ni desactivar el último superadmin activo" });
    }

    if (nombre !== undefined) user.nombre = nombre;
    if (email !== undefined) user.email = email;
    if (rol !== undefined && rol !== user.rol) user.rol = rol;
    if (activo !== undefined) user.activo = activo;
    if (user.rol !== previousRole || user.activo !== previousActive) {
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }

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
  const existing = await Usuario.findById(req.params.id);
  if (["admin", "superadmin"].includes(existing?.rol) && req.user.rol !== "superadmin") {
    return res.status(403).json({ error: "Solo un superadmin puede desactivar una cuenta administrativa" });
  }
  if (isLastActiveSuperadmin(
    existing,
    await Usuario.countDocuments({ rol: "superadmin", activo: true }),
  )) {
    return res.status(409).json({ error: "No se puede desactivar el último superadmin activo" });
  }
  const user = await Usuario.findByIdAndUpdate(
    req.params.id,
    { activo: false, $inc: { tokenVersion: 1 } },
    { new: true },
  );

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ ok: true });
});

router.delete("/:id/permanent", auth, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identificador de usuario inválido" });
    }
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user._id.equals(req.user._id)) {
      return res.status(409).json({ error: "No se puede eliminar la cuenta actualmente autenticada" });
    }
    if (["admin", "superadmin"].includes(user.rol) && req.user.rol !== "superadmin") {
      return res.status(403).json({ error: "Solo un superadmin puede eliminar una cuenta administrativa" });
    }
    if (isLastActiveSuperadmin(
      user,
      await Usuario.countDocuments({ rol: "superadmin", activo: true }),
    )) {
      return res.status(409).json({ error: "No se puede eliminar el último superadmin activo" });
    }

    const [clienteVinculado, profesionalVinculado, servicioCreado, tieneAuditoria] = await Promise.all([
      Cliente.exists({ $or: [{ usuario: user._id }, ...(user.clienteRef ? [{ _id: user.clienteRef }] : [])] }),
      Profesional.exists({ $or: [{ usuario: user._id }, ...(user.profesionalRef ? [{ _id: user.profesionalRef }] : [])] }),
      Servicio.exists({ creadoPor: user._id }),
      Cobertura.exists({ $or: [
        { "pagos.admin": user._id },
        { "pagos.editadoPor": user._id },
        { "pagos.anuladoPor": user._id },
      ] }),
    ]);
    if (tieneAuditoria || clienteVinculado || profesionalVinculado || servicioCreado) {
      return res.status(409).json({ error: "No se puede eliminar: el usuario tiene perfiles o referencias de auditoría" });
    }

    await Usuario.deleteOne({ _id: user._id });
    res.json({ ok: true });
  } catch (_error) {
    res.status(400).json({ error: "No se pudo eliminar el usuario" });
  }
});
// RESET PASSWORD (admin)
router.put(
  "/:id/reset-password",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const { password } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const user = await Usuario.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (["admin", "superadmin"].includes(user.rol) &&
        req.user.rol !== "superadmin" && !user._id.equals(req.user._id)) {
      return res.status(403).json({ error: "Solo un superadmin puede restablecer otra cuenta administrativa" });
    }

    user.password = password;
    user.requiereCambioPassword = user.rol !== "admin";
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    res.json({ ok: true });
  },
);

//-------------------- ASIGNACIONES -----------------------
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
  },
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
  },
);

module.exports = router;
