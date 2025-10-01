const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),  // Carpeta local
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // nombre único
  }
});
const upload = multer({ storage });

router.post('/', upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
