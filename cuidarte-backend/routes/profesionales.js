const express = require('express');
const router = express.Router();
const Profesional = require('../models/Profesional');

// LISTAR
router.get('/', async (_req, res) => {
  const items = await Profesional.find().sort({ createdAt: -1 });
  res.json(items);
});

// CREAR
router.post('/', async (req, res) => {
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

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Profesional.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'Profesional no encontrado' });
    res.json(actualizado);
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.dni) {
      return res.status(409).json({ error: 'Ya existe un profesional con ese DNI' });
    }
    res.status(400).json({ error: e.message });
  }
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  try {
    const borrado = await Profesional.findByIdAndDelete(req.params.id);
    if (!borrado) return res.status(404).json({ error: 'Profesional no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;