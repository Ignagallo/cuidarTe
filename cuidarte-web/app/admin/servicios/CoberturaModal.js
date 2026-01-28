// app/admin/servicios/CoberturaModal.js
"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/* ===== helpers fechas ===== */
function ymdLocal(d) {
  const x = new Date(d);
  return [
    x.getFullYear(),
    String(x.getMonth() + 1).padStart(2, "0"),
    String(x.getDate()).padStart(2, "0"),
  ].join("-");
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function rangoOcurrencias(serv) {
  if (
    !serv?.fechaInicio ||
    !serv?.fechaFin ||
    !Array.isArray(serv?.diasSemana)
  )
    return [];

  const start = startOfDayLocal(serv.fechaInicio);
  const end = startOfDayLocal(serv.fechaFin);
  const out = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (serv.diasSemana.includes(d.getDay())) {
      out.push(ymdLocal(d));
    }
  }
  return out;
}

/* ===== componente ===== */
export default function CoberturaModal({ servicio, onClose, onSaved }) {
  const base = useMemo(() => {
    const occ = rangoOcurrencias(servicio);
    const m = new Map(occ.map((f) => [f, false]));

    (servicio.coberturaDias || []).forEach((cd) => {
      if (!cd?.fecha) return;
      const key = ymdLocal(cd.fecha);
      if (m.has(key)) m.set(key, cd.cubierto === true);
    });

    return m;
  }, [servicio]);

  const [estado, setEstado] = useState(base);
  const [err, setErr] = useState("");

  const toggle = (fecha) => {
    setEstado((prev) => {
      const n = new Map(prev);
      n.set(fecha, !n.get(fecha));
      return n;
    });
  };

  const marcarPorcentaje = (pct) => {
    const arr = Array.from(estado.keys()).sort();
    const n = Math.round(arr.length * pct);
    const nuevo = new Map(estado);
    arr.forEach((f, i) => nuevo.set(f, i < n));
    setEstado(nuevo);
  };

  const guardar = async () => {
    try {
      setErr("");
      const dias = Array.from(estado.entries()).map(
        ([fecha, cubierto]) => ({ fecha, cubierto })
      );

      await apiFetch(`/api/servicios/${servicio._id}/cobertura`, {
        method: "PATCH",
        body: JSON.stringify({ dias }),
      });

      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
  };

  const total = estado.size;
  const cubiertos = Array.from(estado.values()).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-3xl p-6 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1D4A74]">
              Cobertura de pagos
            </h3>
            <p className="text-xs text-gray-500">
              Rango:{" "}
              {new Date(servicio.fechaInicio).toLocaleDateString()} —{" "}
              {new Date(servicio.fechaFin).toLocaleDateString()} • Días:{" "}
              {(servicio.diasSemana || []).map((i) => DIAS[i]).join(", ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Estado */}
        <div className="mt-3 text-sm text-[#1D4A74]">
          Marcados: <strong>{cubiertos}</strong> / {total} (
          {Math.round((cubiertos / Math.max(1, total)) * 100)}%)
        </div>

        {/* Acciones rápidas */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[0.25, 0.5, 0.75, 1, 0].map((p) => (
            <button
              key={p}
              onClick={() => marcarPorcentaje(p)}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              {p * 100}%
            </button>
          ))}
        </div>

        {/* Días */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Array.from(estado.keys())
            .sort()
            .map((f) => {
              const ok = estado.get(f);
              return (
                <button
                  key={f}
                  onClick={() => toggle(f)}
                  className={`text-xs sm:text-sm px-2 py-2 rounded border transition ${
                    ok
                      ? "bg-[#04BF8A] text-white border-[#04BF8A]"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  {new Date(`${f}T00:00:00`).toLocaleDateString()}
                </button>
              );
            })}
        </div>

        {err && <p className="mt-4 text-red-600">{err}</p>}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="px-4 py-2 rounded bg-[#04BF8A] text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
