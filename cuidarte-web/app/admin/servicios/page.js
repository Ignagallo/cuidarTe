// app/admin/servicios/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ServicioFormModal from "./ServicioFormModal";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showCobertura, setShowCobertura] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const selected = useMemo(
    () => servicios.find((s) => s._id === selectedId) || null,
    [servicios, selectedId]
  );

  const load = async () => {
    try {
      setErr("");
      const [s, c, p, t] = await Promise.all([
        apiFetch("/api/servicios"),
        apiFetch("/api/clientes"),
        apiFetch("/api/profesionales"),
        apiFetch("/api/tipos-servicio"),
      ]);
      setServicios(s);
      setClientes(c);
      setProfesionales(p);
      setTiposServicio(t);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetSelection = () => {
    setSelectedId(null);
    setOk("");
    setErr("");
  };

  const onDelete = async () => {
    if (!selected) return;
    const confirmar = window.confirm(
      `¿Eliminar el servicio para ${selected?.cliente?.nombreApellido || "cliente"}?`
    );
    if (!confirmar) return;

    try {
      await apiFetch(`/api/servicios/${selected._id}`, {
        method: "DELETE",
      });
      setOk("Servicio eliminado correctamente");
      resetSelection();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#1D4A74]">Servicios</h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              resetSelection();
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#04BF8A] text-white hover:bg-[#00A884] transition"
          >
            + Nuevo servicio
          </button>

          {selected && (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-xl bg-[#1D4A74] text-white hover:bg-[#163a5c] transition"
              >
                Editar
              </button>

              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* MENSAJES */}
      {err && <p className="text-red-600">{err}</p>}
      {ok && <p className="text-green-600">{ok}</p>}

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1D4A74] text-white">
            <tr>
              <th className="p-3 text-left font-semibold">Tipo</th>
              <th className="p-3 text-left font-semibold">Cliente</th>
              <th className="p-3 text-left font-semibold">Profesional</th>
              <th className="p-3 text-center font-semibold">Rango</th>
              <th className="p-3 text-center font-semibold">Días</th>
              <th className="p-3 text-center font-semibold">Cobertura</th>
            </tr>
          </thead>

          <tbody>
            {servicios.map((s) => {
              const isSel = s._id === selectedId;

              const occ = rangoOcurrencias(s);
              const pagados = (s.coberturaDias || []).filter(
                (cd) => cd?.cubierto && occ.includes(ymdLocal(cd.fecha))
              ).length;
              const pct = occ.length
                ? Math.round((pagados / occ.length) * 100)
                : 0;

              return (
                <tr
                  key={s._id}
                  onClick={() =>
                    setSelectedId((prev) =>
                      prev === s._id ? null : s._id
                    )
                  }
                  className={`
                    border-t cursor-pointer transition-colors
                    ${
                      isSel
                        ? "bg-[#04BF8A]/10"
                        : "hover:bg-[#1D4A74]/5"
                    }
                  `}
                >
                  <td className="p-3 text-[#1D4A74]">
                    {s?.tipoServicio?.nombre || "—"}
                  </td>
                  <td className="p-3 text-[#1D4A74]">
                    {s?.cliente?.nombreApellido || "—"}
                  </td>
                  <td className="p-3 text-[#1D4A74]">
                    {s?.profesional?.nombreApellido || "—"}
                  </td>
                  <td className="p-3 text-center text-[#1D4A74]">
                    {new Date(s.fechaInicio).toLocaleDateString()} —{" "}
                    {new Date(s.fechaFin).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center text-[#1D4A74]">
                    {(s.diasSemana || []).map((i) => DIAS[i]).join(", ")}
                  </td>
                  <td className="p-3 text-center text-[#1D4A74]">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#04BF8A]" />
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}

            {servicios.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No hay servicios cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      {showForm && (
        <ServicioFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          initialData={selected}
          clientes={clientes}
          profesionales={profesionales}
          tiposServicio={tiposServicio}
          onSaved={async (data) => {
            if (selected) {
              await apiFetch(`/api/servicios/${selected._id}`, {
                method: "PUT",
                body: JSON.stringify(data),
              });
              setOk("Servicio actualizado correctamente");
            } else {
              await apiFetch("/api/servicios", {
                method: "POST",
                body: JSON.stringify(data),
              });
              setOk("Servicio creado correctamente");
            }
            resetSelection();
            load();
          }}
        />
      )}

    </div>
  );
}
