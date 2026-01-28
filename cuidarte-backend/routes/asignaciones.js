const express = require("express");
const router = express.Router();
const Asignacion = require("../models/Asignacion");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

// LISTAR todas (admin)
router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const items = await Asignacion.find({ activo: true })
    .populate("cliente")
    .populate("profesional")
    .sort({ createdAt: -1 });

  res.json(items);
});

// LISTAR por cliente
router.get("/cliente/:id", auth, async (req, res) => {
  const items = await Asignacion.find({
    cliente: req.params.id,
    activo: true,
  }).populate("profesional");

  res.json(items);
});

// LISTAR por profesional
router.get("/profesional/:id", auth, async (req, res) => {
  const items = await Asignacion.find({
    profesional: req.params.id,
    activo: true,
  }).populate("cliente");

  res.json(items);
});

// CREAR asignación
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { cliente, profesional } = req.body;

    const nueva = await Asignacion.create({
      cliente,
      profesional,
    });

    res.status(201).json(nueva);
  } catch (e) {
    if (e.code === 11000) {
      return res
        .status(409)
        .json({ error: "La asignación ya existe" });
    }
    res.status(400).json({ error: e.message });
  }
});

// DESACTIVAR (soft delete)
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await Asignacion.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ ok: true });
});

module.exports = router;
