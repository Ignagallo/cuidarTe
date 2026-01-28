// routes/clientes.js
const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const requireRole = require('../middleware/requireRole');
const auth = require('../middleware/auth');


// LISTAR (solo activos)
router.get('/', async (_req, res) => {
  const items = await Cliente.find({ activo: true })
    .sort({ createdAt: -1 });
  res.json(items);
});

// OBTENER UNO
router.get('/:id', auth, requireRole('admin'), async (req, res) => {
  const item = await Cliente.findById(req.params.id);
  if (!item || !item.activo)
    return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(item);
});

// CREAR
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const nuevo = await Cliente.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) 
  {
    if (e.code === 11000 && e.keyPattern?.dni) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI' });
    }
    res.status(400).json({ error: e.message });
  }
});

// ACTUALIZAR
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!actualizado)
      return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(actualizado);
  } catch (e) 
  {
    res.status(400).json({ error: e.message });
  }
});

// DESACTIVAR (soft delete)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const item = await Cliente.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true }
  );
  if (!item)
    return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
