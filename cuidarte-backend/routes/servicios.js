const express = require('express');
const router = express.Router();
const Servicio = require('../models/Servicio');
const Cliente = require('../models/Cliente');
const Profesional = require('../models/Profesional');

router.get('/', async (_req, res) => {
  const items = await Servicio.find()
    .populate('cliente', 'nombreApellido')
    .populate('profesional', 'nombreApellido profesion')
    .sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  try {
    const { cliente, profesional } = req.body;
    if (!await Cliente.findById(cliente)) return res.status(400).json({ error: 'Cliente inválido' });
    if (!await Profesional.findById(profesional)) return res.status(400).json({ error: 'Profesional inválido' });
    const nuevo = await Servicio.create(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/agenda', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Parámetros start y end son requeridos (YYYY-MM-DD)' });
    }

    const startDate = new Date(start);
    const endDate   = new Date(end);

    // Traemos servicios que tienen alguna intersección con [start, end)
    const servicios = await Servicio.find({
      fechaFin:    { $gte: startDate }, // termina después de inicio del rango
      fechaInicio: { $lte: endDate }    // empieza antes del fin del rango
    })
    .populate('cliente', 'nombreApellido')
    .populate('profesional', 'nombreApellido profesion');

    // Helper para recorrer días
    const addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };
    const formatDateTime = (d, timeHHmm) => {
      // Devuelve string ISO local sin zona para que FC lo interprete con TZ del navegador.
      const [hh, mm] = timeHHmm.split(':');
      const dt = new Date(d);
      dt.setHours(parseInt(hh,10), parseInt(mm,10), 0, 0);
      return dt.toISOString(); // si preferís mantenerlo "local", puedes devolver directamente Date
    };

    const events = [];

    for (const s of servicios) {
      // Intersección del rango del servicio con el pedido por el calendario
      const from = (s.fechaInicio > startDate) ? s.fechaInicio : startDate;
      const to   = (s.fechaFin   < endDate)   ? s.fechaFin    : endDate;

      // Recorremos día por día y generamos ocurrencias solo en los días seleccionados
      for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
        const dow = d.getDay(); // 0..6 (Dom..Sáb)
        if (!Array.isArray(s.diasSemana) || !s.diasSemana.includes(dow)) continue;

        // Construimos start/end del evento
        const startISO = formatDateTime(d, s.horaInicio); // ej "08:00"
        const endISO   = formatDateTime(d, s.horaFin);    // ej "12:00"

        events.push({
          id: `${s._id}-${d.toISOString().slice(0,10)}`, // id único por ocurrencia
          title: `${s.tipo} — ${s?.cliente?.nombreApellido || ''} con ${s?.profesional?.nombreApellido || ''}`,
          start: startISO,
          end: endISO,
          allDay: false,
          extendedProps: {
            servicioId: s._id.toString(),
            tipo: s.tipo,
            cliente: s?.cliente || null,
            profesional: s?.profesional || null,
            fecha: d.toISOString().slice(0,10),
            horaInicio: s.horaInicio,
            horaFin: s.horaFin,
            diasSemana: s.diasSemana,
            indicaciones: s.indicaciones || '',
          }
        });
      }
    }

    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error generando agenda' });
  }
});


module.exports = router;