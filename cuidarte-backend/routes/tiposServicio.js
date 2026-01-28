// routes/tiposServicio.js
const express = require("express");
const router = express.Router();
const TipoServicio = require("../models/TipoServicio");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

// listar
router.get("/", auth, async (_req, res) => {
  const items = await TipoServicio.find({ activo: true }).sort({ nombre: 1 });
  res.json(items);
});

// crear
router.post("/", auth, requireRole("admin"), async (req, res) => {
  const nuevo = await TipoServicio.create(req.body);
  res.status(201).json(nuevo);
});

// editar
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  const item = await TipoServicio.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(item);
});

// desactivar
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await TipoServicio.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ ok: true });
});

module.exports = router;
