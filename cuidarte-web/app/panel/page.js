// app/panel/page.js
"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function PanelAgenda() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const lastRangeRef = useRef({ start: null, end: null });

  const plugins = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const locales = useMemo(() => [esLocale], []);

  const fetchEvents = useCallback(async (startStr, endStr) => {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch(
        `/api/servicios/agenda?start=${startStr}&end=${endStr}`,
      );
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = useCallback(
    (arg) => {
      const startStr = arg.startStr.slice(0, 10);
      const endStr = arg.endStr.slice(0, 10);
      const last = lastRangeRef.current;
      if (last.start === startStr && last.end === endStr) return;
      lastRangeRef.current = { start: startStr, end: endStr };
      fetchEvents(startStr, endStr);
    },
    [fetchEvents],
  );

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1D4A74]">Mi agenda</h1>
          <p className="text-gray-600 mt-1">
            Consultá tus visitas y servicios programados
          </p>
        </div>

        <div className="hidden sm:flex items-center justify-center h-25 w-25 rounded-full bg-white shadow">
          <Image
            src="/nuevologoSinFondo.png"
            alt="CuidarTE"
            width={80}
            height={80}
          />
        </div>
      </div>

      {err && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-lg">
          {err}
        </div>
      )}

      {loading && (
        <div className="p-3 text-sm text-gray-600">Cargando eventos…</div>
      )}

      {/* Calendario */}
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <FullCalendar
          plugins={plugins}
          initialView="dayGridMonth"
          events={events}
          locales={locales}
          locale="es"
          expandRows
          height="auto"
          aspectRatio={1.8}
          datesSet={handleDatesSet}
        />
      </div>
    </div>
  );
}
