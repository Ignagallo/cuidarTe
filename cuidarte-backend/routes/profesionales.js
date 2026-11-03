// routes/profesionales.js
const express = require('express');
const router = express.Router();
const Profesional = require('../models/Profesional');
const requireRole = require('../middleware/requireRole');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Servicio = require('../models/Servicio');
const Asignacion = require('../models/Asignacion');
const Usuario = require('../models/Usuario');

// Endpoint público: solo datos que pueden mostrarse en la landing.
router.get('/publicos', async (_req, res) => {
  try {
    const items = await Profesional.find({ activo: true })
      .select('nombreApellido profesion fotoUrl -_id')
      .sort({ nombreApellido: 1 })
      .lean();
    res.json(items);
  } catch (_error) {
    res.status(500).json({ error: 'No se pudieron cargar los profesionales' });
  }
});

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

router.delete('/:id/permanent', auth, requireRole('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador de profesional inválido' });
    }
    const profesional = await Profesional.findById(req.params.id);
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado' });
    const [tieneServicios, tieneAsignaciones, tieneUsuarios] = await Promise.all([
      Servicio.exists({ profesional: profesional._id }),
      Asignacion.exists({ profesional: profesional._id }),
      Usuario.exists({ $or: [{ profesionalRef: profesional._id }, { _id: profesional.usuario }] }),
    ]);
    if (tieneServicios || tieneAsignaciones || tieneUsuarios) {
      return res.status(409).json({ error: 'No se puede eliminar: el profesional tiene servicios, asignaciones o una cuenta vinculada' });
    }
    await Profesional.deleteOne({ _id: profesional._id });
    res.json({ ok: true });
  } catch (_error) {
    res.status(400).json({ error: 'No se pudo eliminar el profesional' });
  }
});

module.exports = router;
