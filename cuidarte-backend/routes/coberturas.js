const express = require("express");
const router = express.Router();
const Cobertura = require("../models/Cobertura");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const recalcularCobertura = require("../utils/recalcularCobertura");

/**
 * GET /api/coberturas
 * Listar coberturas
 */
router.get("/", auth, async (_req, res) => {
  const items = await Cobertura.find()
    .populate({
      path: "servicio",
      populate: [
        { path: "cliente", select: "nombreApellido" },
        { path: "tipoServicio", select: "nombre color" },
      ],
    })
    .populate("pagos.admin", "nombre email")
    .sort({ updatedAt: -1 })
    .lean();

  res.json(items);
});

/**
 * PUT /api/coberturas/:id
 * Actualizar estado de cobertura
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { estado, motivo } = req.body;

    const updated = await Cobertura.findByIdAndUpdate(
      req.params.id,
      { estado, motivo },
      { new: true },
    );

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error actualizando cobertura" });
  }
});

/**
 * POST /api/coberturas/:servicioId/pagos
 * Registrar un pago
 */
router.post("/:servicioId/pagos", auth, requireRole("admin"), async (req, res) => {
  try {
    const { monto, nota } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const cobertura = await Cobertura.findOne({
      servicio: req.params.servicioId,
    });

    if (!cobertura) {
      return res.status(404).json({ error: "Cobertura no encontrada" });
    }

    cobertura.pagos.push({
      monto: Number(monto),
      nota,
      admin: req.user._id,
    });

    recalcularCobertura(cobertura);
      await cobertura.save();

    res.json(cobertura);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error registrando pago" });
  }
});

// PUT /api/coberturas/:coberturaId/pagos/:pagoId
router.put(
  "/:coberturaId/pagos/:pagoId",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { monto, nota } = req.body;

      if (!monto || Number(monto) <= 0) {
        return res.status(400).json({ error: "Monto inválido" });
      }

      const cobertura = await Cobertura.findById(req.params.coberturaId);
      if (!cobertura) {
        return res.status(404).json({ error: "Cobertura no encontrada" });
      }

      const pago = cobertura.pagos.id(req.params.pagoId);
      if (!pago || pago.anulado) {
        return res.status(404).json({ error: "Pago no editable" });
      }

      pago.monto = Number(monto);
      pago.nota = nota;
      pago.editadoPor = req.user._id;
      pago.editadoEn = new Date();

      recalcularCobertura(cobertura);
      await cobertura.save();

      res.json(cobertura);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error editando pago" });
    }
  }
);
// DELETE /api/coberturas/:coberturaId/pagos/:pagoId
router.delete(
  "/:coberturaId/pagos/:pagoId",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const cobertura = await Cobertura.findById(req.params.coberturaId);
      if (!cobertura) {
        return res.status(404).json({ error: "Cobertura no encontrada" });
      }

      const pago = cobertura.pagos.id(req.params.pagoId);
      if (!pago || pago.anulado) {
        return res.status(404).json({ error: "Pago no anulable" });
      }

      pago.anulado = true;
      pago.anuladoPor = req.user._id;
      pago.anuladoEn = new Date();

      recalcularCobertura(cobertura);
      await cobertura.save();

      res.json(cobertura);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error anulando pago" });
    }
  }
);


module.exports = router;
