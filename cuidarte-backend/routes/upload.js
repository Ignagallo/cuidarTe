const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validateImage = require('../utils/validateImage');
const Profesional = require('../models/Profesional');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
});

router.post('/', auth, requireRole('admin'), upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
    const extension = validateImage(req.file.mimetype, req.file.buffer);
    if (!extension) {
      return res.status(400).json({ error: 'Formato de imagen no válido' });
    }

    const filename = `${crypto.randomUUID()}${extension}`;
    const uploadDirectory = path.resolve('uploads');
    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(path.join(uploadDirectory, filename), req.file.buffer, { flag: 'wx' });
    res.json({ url: `/uploads/${filename}` });
  } catch (_error) {
    res.status(500).json({ error: 'Error guardando imagen' });
  }
});

router.delete('/:filename', auth, requireRole('admin'), async (req, res) => {
  const { filename } = req.params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(filename)) {
    return res.status(400).json({ error: 'Archivo de imagen inválido' });
  }

  const url = `/uploads/${filename}`;
  try {
    if (await Profesional.exists({ fotoUrl: url })) {
      return res.status(409).json({ error: 'La imagen sigue asociada a un profesional y se conservó' });
    }
    await fs.unlink(path.join(path.resolve('uploads'), filename));
    res.json({ ok: true });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ error: 'Imagen no encontrada' });
    res.status(500).json({ error: 'No se pudo eliminar la imagen' });
  }
});

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'La imagen no puede superar 5MB' });
  }
  if (error) return res.status(400).json({ error: 'No se pudo procesar la imagen' });
  next();
});

module.exports = router;
