// cuidarte-web/app/admin/page.js
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { apiFetch } from "@/lib/api";

/* ================= UTILS ================= */
function getContrastingTextColor(hex) {
  if (!hex) return "#fff";
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

function formatFecha(date) {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* ================= PAGE ================= */
export default function AdminDashboard() {
  const calendarRef = useRef(null);
  const lastRangeRef = useRef({ start: null, end: null });

  const [resumenPorDia, setResumenPorDia] = useState({});
  const [activeDate, setActiveDate] = useState(new Date());
  const [serviciosDelDia, setServiciosDelDia] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [viewType, setViewType] = useState("dayGridMonth");

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  useEffect(() => {
    if (viewType === "timeGridDay") {
      const fecha = activeDate.toISOString().slice(0, 10);
      fetchResumen(fecha, fecha);
    }
  }, [activeDate, viewType]);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    fetchResumen(start, end);
  }, []);
  /* ================= FETCH ================= */
  const fetchResumen = useCallback(async (start, end) => {
    try {
      const data = await apiFetch(
        `/api/agenda/resumen?start=${start}&end=${end}`,
      );
      setResumenPorDia(data || {});
    } catch {
      setResumenPorDia({});
    }
  }, []);

  const fetchServiciosDelDia = async (fecha) => {
    try {
      const data = await apiFetch(`/api/agenda/dia?fecha=${fecha}`);
      setServiciosDelDia(Array.isArray(data) ? data : []);
      setShowDayModal(true);
    } catch {
      setServiciosDelDia([]);
    }
  };

  /* ================= CALENDAR ================= */
  const handleDatesSet = useCallback(
    (arg) => {
      const start = arg.startStr.slice(0, 10);
      const end = arg.endStr.slice(0, 10);

      const last = lastRangeRef.current;

      // 🔥 SOLO recargar si el rango cambió
      if (last.start !== start || last.end !== end) {
        lastRangeRef.current = { start, end };
        fetchResumen(start, end);
      }

      // Solo guardamos la vista
      setViewType(arg.view.type);
    },
    [fetchResumen],
  );

  const serviciosFiltrados = tipoFiltro
    ? serviciosDelDia.filter((s) => s.tipoServicio?._id === tipoFiltro)
    : serviciosDelDia;

  const fechaActiva = activeDate.toISOString().slice(0, 10);

  const resumenDia = resumenPorDia[fechaActiva] || [];
  return (
    <div className="space-y-2">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D4A74]">
          Agenda de servicios
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (viewType === "dayGridMonth") {
                calendarRef.current?.getApi().prev();
              } else {
                const newDate = new Date(activeDate);
                newDate.setDate(newDate.getDate() - 1);
                setActiveDate(newDate);
              }
            }}
            className="btn-nav"
          >
            ‹
          </button>

          <button
            onClick={() => {
              if (viewType === "dayGridMonth") {
                calendarRef.current?.getApi().today();
              } else {
                const today = new Date();
                setActiveDate(today);
              }
            }}
            className="btn-nav"
          >
            Hoy
          </button>

          <button
            onClick={() => {
              if (viewType === "dayGridMonth") {
                calendarRef.current?.getApi().next();
              } else {
                const newDate = new Date(activeDate);
                newDate.setDate(newDate.getDate() + 1);
                setActiveDate(newDate);
              }
            }}
            className="btn-nav"
          >
            ›
          </button>

          <button
            onClick={() => {
              setViewType("dayGridMonth");
              calendarRef.current?.getApi().changeView("dayGridMonth");
            }}
            className="btn-view"
          >
            Mes
          </button>

          <button
            onClick={() => setViewType("timeGridDay")}
            className="btn-view"
          >
            Día
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 bg-red-500 text-white rounded-lg text-sm">
          {err}
        </div>
      )}

      {loading && (
        <div className="p-3 text-sm text-gray-600">Cargando agenda…</div>
      )}

      {/* ================= MES ================= */}
      {viewType === "dayGridMonth" && (
        <div className="bg-white rounded-2xl shadow p-2">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            locales={[esLocale]}
            headerToolbar={{
              left: "",
              center: "title",
              right: "",
            }}
            height="80vh"
            datesSet={handleDatesSet}
            dateClick={(info) => {
              if (viewType === "dayGridMonth") {
                // Cambiar a vista diaria
                setActiveDate(info.date);
                setViewType("timeGridDay");
              } else {
                // En vista diaria seguimos mostrando el modal
                setActiveDate(info.date);
                fetchServiciosDelDia(info.dateStr);
              }
            }}
            dayCellContent={(arg) => {
              const fecha = arg.date.toISOString().slice(0, 10);
              const resumen = resumenPorDia[fecha];

              return (
                <div className="relative h-full">
                  <div className="text-sm font-medium p-1 text-right cursor-pointer hover:text-[#04BF8A] hover:rounded-lg hover:bg-[#1d4a74] transition">
                    {arg.dayNumberText}
                  </div>

                  {Array.isArray(resumen) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {resumen.map((r) => (
                        <div
                          key={r.tipoId}
                          onClick={() => {
                            setTipoFiltro(r.tipoId);
                            setActiveDate(arg.date);
                            fetchServiciosDelDia(fecha);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shadow-md hover:scale-110 transition"
                          style={{
                            backgroundColor: r.color,
                            color: getContrastingTextColor(r.color),
                          }}
                        >
                          {r.cantidad}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      )}

      {/* ================= DÍA ================= */}
      {viewType === "timeGridDay" && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-xl font-semibold text-[#1D4A74] capitalize pb-4 border-b-2 border-gray-200">
            {formatFecha(activeDate)}
          </h2>

          {resumenDia.length === 0 && (
            <p className="text-gray-500">No hay servicios este día</p>
          )}

          {[...resumenDia]
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((r) => (
              <div
                key={r.tipoId}
                onClick={() => {
                  setTipoFiltro(r.tipoId);
                  fetchServiciosDelDia(fechaActiva);
                }}
                className="flex justify-between items-center px-4 py-3 rounded-xl font-semibold cursor-pointer transition hover:bg-gray-50"
                style={{
                  borderLeft: `6px solid ${r.color}`,
                }}
              >
                <span className="text-[#1D4A74]">{r.nombre}</span>
                <span className="text-[#1D4A74]">{r.cantidad}</span>
              </div>
            ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showDayModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 grid place-items-center cursor-pointer"
          onClick={() => setShowDayModal(false)}
        >
          <div
            className="bg-white w-[95vw] max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-[#1D4A74] mb-4 capitalize">
              {formatFecha(activeDate)}
            </h2>

            <div className="space-y-4">
              {serviciosFiltrados.map((s) => (
                <div
                  key={s._id}
                  className="rounded-xl border p-4"
                  style={{
                    borderLeft: `6px solid ${s.tipoServicio.color}`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#1D4A74]">
                        {s.tipoServicio.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {s.horaInicio} – {s.horaFin}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        s.cobertura?.estado === "pago"
                          ? "bg-green-100 text-green-700"
                          : s.cobertura?.estado === "parcial"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.cobertura?.estado || "impago"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    👤 {s.cliente.nombreApellido}
                    <br />
                    🧑 {s.profesional.nombreApellido}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setTipoFiltro(null);
                  setShowDayModal(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-[#1D4A74] font-medium hover:bg-[#04BF8A] hover:text-white transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
