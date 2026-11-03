// routes/agenda.js
const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const Cobertura = require("../models/Cobertura");

function generarDias(servicio, start, end) {
  const dias = [];
  const inicio = new Date(
    servicio.fechaInicio > start ? servicio.fechaInicio : start,
  );
  const fin = new Date(
    servicio.fechaFin && servicio.fechaFin < end ? servicio.fechaFin : end,
  );

  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    if (servicio.diasSemana.includes(d.getDay())) {
      dias.push(new Date(d));
    }
  }

  return dias;
}

// dentro del loop de servicios
router.get("/", auth, requireRole("admin"), async (req, res) => {
  const cobertura = await Cobertura.findOne();
  res.json(cobertura);
});

router.get("/resumen", auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Rango inválido" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const servicios = await Servicio.find({
      estado: "activo",
      fechaInicio: { $lte: endDate },
      $or: [{ fechaFin: null }, { fechaFin: { $gte: startDate } }],
    })
      .populate("tipoServicio", "nombre color")
      .lean();

    const resumen = {};

    for (const s of servicios) {
      const dias = generarDias(s, startDate, endDate);

      for (const d of dias) {
        const key = d.toISOString().slice(0, 10);

        if (!resumen[key]) resumen[key] = [];

        let entry = resumen[key].find(
          (e) => e.tipoId === String(s.tipoServicio._id),
        );
        const cobertura = await Cobertura.findOne({ servicio: s._id }).lean();
        if (!entry) {
          entry = {
            tipoId: String(s.tipoServicio._id),
            nombre: s.tipoServicio.nombre,
            color: s.tipoServicio.color,
            cantidad: 0,
            estadoCobertura: cobertura?.estado || "sin_cobertura",
          };
          resumen[key].push(entry);
        }

        entry.cantidad += 1;
      }
    }

    res.json(resumen);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error generando resumen" });
  }
});

// GET /api/agenda/dia?fecha=YYYY-MM-DD
router.get("/dia", auth, async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const date = new Date(fecha);
    const day = date.getDay();

    const servicios = await Servicio.find({
      estado: "activo",
      fechaInicio: { $lte: date },
      $or: [{ fechaFin: null }, { fechaFin: { $gte: date } }],
      diasSemana: day,
    })
      .populate("cliente", "nombreApellido")
      .populate("profesional", "nombreApellido profesion")
      .populate("tipoServicio", "nombre color")
      .lean();
    const serviciosConCobertura = await Promise.all(
      servicios.map(async (s) => {
        const cobertura = await Cobertura.findOne({ servicio: s._id }).lean();

        return {
          ...s,
          cobertura: {
            estado: cobertura?.estado || "sin_cobertura",
          },
        };
      }),
    );
    return res.json(serviciosConCobertura);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error obteniendo servicios del día" });
  }
});

module.exports = router;
