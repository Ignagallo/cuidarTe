const express = require("express");
const router = express.Router();

const Servicio = require("../models/Servicio");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const Cobertura = require("../models/Cobertura");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const recalcularCobertura = require("../utils/recalcularCobertura");
const deleteServiceAndCoverage = require("../utils/deleteServiceAndCoverage");

/* ======================================================
   HELPERS
====================================================== */

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatDateTime(d, timeHHmm) {
  const [hh, mm] = timeHHmm.split(":");
  const dt = new Date(d);
  dt.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
  return dt.toISOString();
}

/* ======================================================
   LISTAR SERVICIOS (ADMIN)
====================================================== */
router.get("/", auth, requireRole("admin"), async (_req, res) => {
  const items = await Servicio.find()
    .populate("cliente", "nombreApellido")
    .populate("profesional", "nombreApellido profesion")
    .populate("tipoServicio", "nombre")
    .sort({ createdAt: -1 });

  res.json(items);
});

/* ======================================================
   CREAR SERVICIO (ADMIN)
====================================================== */
router.post("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { cliente, profesional } = req.body;

    if (!(await Cliente.findById(cliente))) {
      return res.status(400).json({ error: "Cliente inválido" });
    }

    if (!(await Profesional.findById(profesional))) {
      return res.status(400).json({ error: "Profesional inválido" });
    }

    const nuevo = await Servicio.create({
      ...req.body,
      importe: Number(req.body.importe) || 0,
      creadoPor: req.user._id,
    });

    // luego de crear el servicio
    await Cobertura.create({
      servicio: nuevo._id,
      totalServicio: nuevo.importe,
    });

    res.status(201).json(nuevo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ======================================================
   AGENDA DERIVADA DE SERVICIOS
   (admin / cliente / profesional)
====================================================== */
router.get("/agenda", auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Rango de fechas inválido" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const { rol, profesional, cliente } = req.user;

    const filtro = {
      estado: "activo",
      fechaInicio: { $lte: endDate },
      $or: [
        { fechaFin: { $gte: startDate } },
        { fechaFin: { $exists: false } }, // servicios indefinidos
      ],
    };

    if (rol === "profesional") {
      filtro.profesional = profesional;
    }

    if (rol === "cliente") {
      filtro.cliente = cliente;
    }

    const servicios = await Servicio.find(filtro)
      .populate("cliente", "nombreApellido")
      .populate("profesional", "nombreApellido profesion")
      .populate("tipoServicio", "nombre");

    const events = [];

    for (const s of servicios) {
      const from = s.fechaInicio > startDate ? s.fechaInicio : startDate;
      const to = s.fechaFin
        ? s.fechaFin < endDate
          ? s.fechaFin
          : endDate
        : endDate;

      for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
        if (!s.diasSemana.includes(d.getDay())) continue;

        events.push({
          id: `${s._id}-${d.toISOString().slice(0, 10)}`,
          title: `${s.tipoServicio?.nombre || "Servicio"} — ${
            s?.cliente?.nombreApellido || ""
          }`,
          start: formatDateTime(d, s.horaInicio),
          end: formatDateTime(d, s.horaFin),
          allDay: false,
          extendedProps: {
            servicioId: s._id.toString(),
            cliente: s?.cliente || null,
            profesional: s?.profesional || null,
            tipoServicio: s?.tipoServicio || null,
            fecha: d.toISOString().slice(0, 10),
            horaInicio: s.horaInicio,
            horaFin: s.horaFin,
            diasSemana: s.diasSemana,
            indicaciones: s.indicaciones || "",
          },
        });
      }
    }

    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error generando agenda" });
  }
});

/* ======================================================
   EDITAR SERVICIO (ADMIN)
====================================================== */
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const servicioActual = await Servicio.findById(req.params.id);
    if (!servicioActual) return res.status(404).json({ error: "No encontrado" });

    const importeAnterior = servicioActual.importe;
    const cobertura = await Cobertura.findOne({ servicio: servicioActual._id });
    if (req.body.importe !== undefined && !cobertura) {
      return res.status(409).json({ error: "El servicio no tiene una cobertura asociada; no se actualizó el importe" });
    }

    const s = await Servicio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!s) return res.status(404).json({ error: "No encontrado" });

    const coberturaDesincronizada = cobertura &&
      Number(cobertura.totalServicio) !== Number(s.importe);
    if (cobertura && (req.body.importe !== undefined || coberturaDesincronizada)) {
      cobertura.totalServicio = s.importe;
      recalcularCobertura(cobertura);
      try {
        await cobertura.save();
      } catch (error) {
        await Servicio.updateOne(
          { _id: s._id, importe: s.importe },
          { $set: { importe: importeAnterior } },
        );
        throw error;
      }
    }
    res.json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ======================================================
   CANCELAR SERVICIO (ADMIN)
====================================================== */
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  const s = await Servicio.findByIdAndUpdate(
    req.params.id,
    { estado: "cancelado" },
    { new: true },
  );
  if (!s) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

router.delete("/:id/permanent", auth, requireRole("admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Identificador de servicio inválido" });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let outcome;
    await session.withTransaction(async () => {
      outcome = await deleteServiceAndCoverage({
        serviceId: req.params.id,
        session,
        Servicio,
        Cobertura,
      });
    });
    res.status(outcome.status).json(outcome.body || { error: outcome.error });
  } catch (_error) {
    res.status(503).json({
      error: "No se pudo completar la eliminación atómica; no se confirmó ningún cambio",
    });
  } finally {
    if (session) await session.endSession();
  }
});

module.exports = router;
