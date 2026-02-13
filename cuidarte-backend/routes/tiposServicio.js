// routes/tiposServicio.js
const express = require("express");
const router = express.Router();

const TipoServicio = require("../models/TipoServicio");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

/* ================= LISTAR ================= */
router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const items = await TipoServicio.find().sort({ nombre: 1 });
  res.json(items);
});

/* ================= CREAR ================= */
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const item = await TipoServicio.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ================= EDITAR ================= */
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const item = await TipoServicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item)
      return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ================= DESACTIVAR ================= */
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  const item = await TipoServicio.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true }
  );
  if (!item)
    return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

module.exports = router;

