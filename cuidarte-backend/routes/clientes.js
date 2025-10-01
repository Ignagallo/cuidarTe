const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// LISTAR
router.get('/', async (_req, res) => {
  const items = await Cliente.find().sort({ createdAt: -1 });
  res.json(items);
});

// CREAR
router.post('/', async (req, res) => {
  try {
    const nuevo = await Cliente.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    // VALIDAR SI YA ESTÁ CARGADO
    if (e.code === 11000 && e.keyPattern?.dni) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI' });
    }
    res.status(400).json({ error: e.message });
  }
});

// ACTUALIZAR
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(actualizado);
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.dni) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI' });
    }
    res.status(400).json({ error: e.message });
  }
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  try {
    const borrado = await Cliente.findByIdAndDelete(req.params.id);
    if (!borrado) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;