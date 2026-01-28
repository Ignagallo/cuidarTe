const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const auth = require("../middleware/auth");

// Bloque de cobertura dias
function mapaCobertura(serv) {
  const m = new Map();
  (serv.coberturaDias || []).forEach((cd) => {
    if (!cd || !cd.fecha) return;
    const key = [
      new Date(cd.fecha).getFullYear(),
      String(new Date(cd.fecha).getMonth() + 1).padStart(2, "0"),
      String(new Date(cd.fecha).getDate()).padStart(2, "0"),
    ].join("-");
    m.set(key, cd.cubierto === true);
  });
  return m;
}

// --- Helpers de rango de días del servicio ---
function ceroHora(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ocurrenciasDelServicio(serv) {
  const { fechaInicio, fechaFin, diasSemana } = serv;
  if (!fechaInicio || !fechaFin || !Array.isArray(diasSemana)) return [];
  const out = [];
  const start = ceroHora(fechaInicio);
  const end = ceroHora(fechaFin);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (diasSemana.includes(d.getDay())) {
      out.push(new Date(d));
    }
  }
  return out;
}

router.get("/", async (_req, res) => {
  const items = await Servicio.find()
    .populate("cliente", "nombreApellido")
    .populate("profesional", "nombreApellido profesion")
    .sort({ createdAt: -1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { cliente, profesional } = req.body;
    if (!(await Cliente.findById(cliente)))
      return res.status(400).json({ error: "Cliente inválido" });
    if (!(await Profesional.findById(profesional)))
      return res.status(400).json({ error: "Profesional inválido" });
    const nuevo = await Servicio.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

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
      fechaFin: { $gte: new Date(start) },
      fechaInicio: { $lte: new Date(end) },
    };

    if (rol === "profesional") {
      filtro.profesional = profesional;
    }

    if (rol === "cliente") {
      filtro.cliente = cliente;
    }

    const servicios = await Servicio.find(filtro)
      .populate("cliente", "nombreApellido")
      .populate("profesional", "nombreApellido profesion");

    // Helper para recorrer días
    const addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };
    const formatDateTime = (d, timeHHmm) => {
      const [hh, mm] = timeHHmm.split(":");
      const dt = new Date(d);
      dt.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      return dt.toISOString(); // si preferís mantenerlo "local", puedes devolver directamente Date
    };

    const events = [];

    for (const s of servicios) {
      // Intersección del rango del servicio con el pedido por el calendario
      const from = s.fechaInicio > startDate ? s.fechaInicio : startDate;
      const to = s.fechaFin < endDate ? s.fechaFin : endDate;
      // traer mapa de cobertura del servicio
      const cobertura = mapaCobertura(s);

      // Recorremos día por día y generamos ocurrencias solo en los días seleccionados
      for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
        const dow = d.getDay(); // 0..6 (Dom..Sáb)
        if (!Array.isArray(s.diasSemana) || !s.diasSemana.includes(dow))
          continue;

        // Construimos start/end del evento
        const startISO = formatDateTime(d, s.horaInicio); // ej "08:00"
        const endISO = formatDateTime(d, s.horaFin); // ej "12:00"

        events.push({
          id: `${s._id}-${d.toISOString().slice(0, 10)}`, // id único por ocurrencia
          title: `${s.tipo} — ${s?.cliente?.nombreApellido || ""} con ${
            s?.profesional?.nombreApellido || ""
          }`,
          start: startISO,
          end: endISO,
          allDay: false,
          //pintar según cobertura
          color:
            cobertura.get(d.toISOString().slice(0, 10)) === true
              ? "#04BF8A"
              : "#EF4444",
          extendedProps: {
            servicioId: s._id.toString(),
            tipo: s.tipo,
            cliente: s?.cliente || null,
            profesional: s?.profesional || null,
            fecha: d.toISOString().slice(0, 10),
            horaInicio: s.horaInicio,
            horaFin: s.horaFin,
            diasSemana: s.diasSemana,
            indicaciones: s.indicaciones || "",
            //flag para usar en el modal
            cubierto: cobertura.get(d.toISOString().slice(0, 10)) === true,
          },
        });
      }
    }

    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message || "Error generando agenda" });
  }
});

// ✅ EDITAR
router.put("/:id", async (req, res) => {
  try {
    const s = await Servicio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!s) return res.status(404).json({ error: "No encontrado" });
    res.json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ✅ ELIMINAR
router.delete("/:id", async (req, res) => {
  const s = await Servicio.findByIdAndUpdate(
    req.params.id,
    { estado: "cancelado" },
    { new: true },
  );
  if (!s) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

// ✅ COBERTURA: marcar días
// body: { dias: [{fecha:'YYYY-MM-DD', cubierto:true/false, nota?:string}] }
router.patch("/:id/cobertura", async (req, res) => {
  try {
    const s = await Servicio.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "No encontrado" });

    const ocurrencias = new Set(
      ocurrenciasDelServicio(s).map((d) => d.toISOString().slice(0, 10)),
    );
    const entrada = Array.isArray(req.body?.dias) ? req.body.dias : [];

    // filtrar solo días válidos del servicio
    const updates = entrada
      .map((d) => ({ ...d, fecha: d.fecha?.slice(0, 10) }))
      .filter((d) => d.fecha && ocurrencias.has(d.fecha));

    // aplicar (upsert por fecha dentro de coberturaDias)
    const mapa = new Map(
      s.coberturaDias.map((cd) => [cd.fecha.toISOString().slice(0, 10), cd]),
    );
    for (const d of updates) {
      const exist = mapa.get(d.fecha);
      const fechaDate = new Date(d.fecha + "T00:00:00");
      if (exist) {
        exist.cubierto = !!d.cubierto;
        if (typeof d.nota === "string") exist.nota = d.nota;
      } else {
        mapa.set(d.fecha, {
          fecha: fechaDate,
          cubierto: !!d.cubierto,
          nota: d.nota || undefined,
        });
      }
    }
    s.coberturaDias = Array.from(mapa.values()).sort(
      (a, b) => a.fecha - b.fecha,
    );
    await s.save();
    res.json({ ok: true, coberturaDias: s.coberturaDias });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
