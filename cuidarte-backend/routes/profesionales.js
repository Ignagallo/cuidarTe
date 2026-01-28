// routes/profesionales.js
const express = require('express');
const router = express.Router();
const Profesional = require('../models/Profesional');
const requireRole = require('../middleware/requireRole');
const auth = require('../middleware/auth');

// LISTAR (admin)
router.get('/', auth, requireRole('admin'), async (_req, res) => {
  const items = await Profesional.find({ activo: true })
    .sort({ createdAt: -1 });
  res.json(items);
});

// OBTENER UNO (admin)
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  const item = await Profesional.findById(req.params.id);
  if (!item || !item.activo)
    return res.status(404).json({ error: 'Profesional no encontrado' });
  res.json(item);
});

// CREAR (admin)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const nuevo = await Profesional.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.dni) {
      return res.status(409).json({ error: 'Ya existe un profesional con ese DNI' });
    }
    res.status(400).json({ error: e.message });
  }
});

// ACTUALIZAR (admin)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const actualizado = await Profesional.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado)
      return res.status(404).json({ error: 'Profesional no encontrado' });
    res.json(actualizado);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DESACTIVAR (admin)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const item = await Profesional.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true }
  );
  if (!item)
    return res.status(404).json({ error: 'Profesional no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
