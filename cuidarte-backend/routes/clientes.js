// routes/clientes.js
const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const requireRole = require('../middleware/requireRole');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Servicio = require('../models/Servicio');
const Asignacion = require('../models/Asignacion');
const Usuario = require('../models/Usuario');


// LISTAR para administración; por defecto solo devuelve perfiles activos.
router.get('/', auth, requireRole('admin'), async (req, res) => {
  const filtro = req.query.includeInactive === 'true' ? {} : { activo: true };
  const items = await Cliente.find(filtro)
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

router.delete('/:id/permanent', auth, requireRole('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de cliente inválido' });
    }
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    const [tieneServicios, tieneAsignaciones, tieneUsuarios] = await Promise.all([
      Servicio.exists({ cliente: cliente._id }),
      Asignacion.exists({ cliente: cliente._id }),
      Usuario.exists({ $or: [{ clienteRef: cliente._id }, { _id: cliente.usuario }] }),
    ]);
    if (tieneServicios || tieneAsignaciones || tieneUsuarios) {
      return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene servicios, asignaciones o una cuenta vinculada' });
    }
    await Cliente.deleteOne({ _id: cliente._id });
    res.json({ ok: true });
  } catch (_error) {
    res.status(400).json({ error: 'No se pudo eliminar el cliente' });
  }
});

module.exports = router;
