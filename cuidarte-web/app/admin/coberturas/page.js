// admin/coberturas/page.js
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import GestionPagosModal from "./GestionPagosModal";
import EstadoCoberturaBadge from "./EstadoCoberturaBadge";
import DeletePermanentlyButton from "@/components/DeletePermanentlyButton";


export default function CoberturasPage() {
  const [coberturas, setCoberturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [coberturaActiva, setCoberturaActiva] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFinanciero, setEstadoFinanciero] = useState("todos");
  const [estadoServicio, setEstadoServicio] = useState("todos");

  const load = async () => {
    try {
      const data = await apiFetch("/api/coberturas");
      setCoberturas(Array.isArray(data) ? data : []);
      return true;
    } catch (e) {
      console.error(e);
      setCoberturas([]);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const filteredCoberturas = coberturas.filter((c) => {
    const q = search.toLowerCase();

    const cliente = c.servicio?.cliente?.nombreApellido?.toLowerCase() || "";

    const servicio = c.servicio?.tipoServicio?.nombre?.toLowerCase() || "";

    const estado = c.estado?.toLowerCase() || "";
    const searchMatches = cliente.includes(q) || servicio.includes(q) || estado.includes(q);
    const financialStateMatches = estadoFinanciero === "todos" || c.estado === estadoFinanciero;
    const outstandingBalance = Number(c.totalServicio || 0) > Number(c.totalPagado || 0);
    const operatingStateMatches =
      estadoServicio === "todos" ||
      c.servicio?.estado === estadoServicio ||
      outstandingBalance;

    return searchMatches && financialStateMatches && operatingStateMatches;
  });

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Cargando coberturas…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold text-[#1D4A74]">
        Coberturas de servicios
      </h1>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por cliente, servicio o estado…"
          aria-label="Buscar coberturas"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full
          px-4 py-2.5 rounded-xl
          border border-gray-300
          text-[#1D4A74]
          focus:outline-none
          focus:ring-2 focus:ring-[#04BF8A]
          focus:border-[#04BF8A]"
        />
        <div>
          <label className="sr-only" htmlFor="filtro-estado-financiero">Filtrar por estado financiero</label>
          <select
            id="filtro-estado-financiero"
            value={estadoFinanciero}
            onChange={(e) => setEstadoFinanciero(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
          >
            <option value="todos">Todos los estados financieros</option>
            <option value="impago">Impago</option>
            <option value="parcial">Parcial</option>
            <option value="pago">Pago</option>
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="filtro-estado-operativo">Filtrar por estado del servicio</label>
          <select
            id="filtro-estado-operativo"
            value={estadoServicio}
            onChange={(e) => setEstadoServicio(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
          >
            <option value="todos">Todos los estados del servicio</option>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
      </div>
      </div>
      {estadoServicio !== "todos" && <p role="note" className="text-sm text-slate-600">Las coberturas con saldo pendiente también se muestran aunque el servicio tenga otro estado operativo.</p>}
      <p className="text-sm text-slate-500">Mostrando {filteredCoberturas.length} de {coberturas.length} coberturas</p>
      {coberturas.length === 0 && (
        <p className="text-gray-500">No hay coberturas registradas</p>
      )}
      {/* DESKTOP */}
      <div className="bg-white hidden lg:block rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#1D4A74] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Servicio</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-center">Estado del servicio</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Pagado</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-center">Acción</th>
            </tr>
          </thead>

          <tbody className="text-[#1D4A74]">
            {filteredCoberturas.map((c) => (
              <tr
                key={c._id}
                className="border-t hover:bg-[#1D4A74]/5 transition-colors"
              >
                <td className="px-4 py-2">
                  {c.servicio?.tipoServicio?.nombre}
                </td>

                <td className="px-4 py-2">
                  {c.servicio?.cliente?.nombreApellido}
                </td>
                <td className="px-4 py-2 text-center"><EstadoServicioBadge estado={c.servicio?.estado} /></td>

                <td className="px-4 py-2 text-right">${c.totalServicio}</td>

                <td className="px-4 py-2 text-right">${c.totalPagado}</td>

                <td className="px-4 py-2 text-center">
                  <EstadoCoberturaBadge estado={c.estado} />
                </td>

                <td className="px-4 py-2 text-center">
                  <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => setCoberturaActiva(c)}
                    className="px-2 py-1 rounded-xl border text-sm
                      bg-[#04BF8A] text-white
                      hover:bg-[#00a884]
                      transition cursor-pointer
                    "
                  >
                    Gestionar pagos
                  </button>
                  <DeletePermanentlyButton label="Eliminar cobertura" recordLabel={`Cobertura de ${c.servicio?.tipoServicio?.nombre || "servicio"} — ${c.servicio?.cliente?.nombreApellido || c._id.slice(-6)}`} endpoint={`/api/coberturas/${c._id}/permanent`} onDeleted={load} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* TABLET + MOBILE */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCoberturas.map((c) => (
          <div
            key={c._id}
            className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm
             hover:shadow-md transition"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {c.servicio?.tipoServicio?.nombre}
                </p>
                <p className="text-xs text-slate-600">
                  {c.servicio?.cliente?.nombreApellido}
                </p>
              </div>
                <div className="flex flex-col items-end gap-1">
                  <EstadoCoberturaBadge estado={c.estado} />
                  <EstadoServicioBadge estado={c.servicio?.estado} />
                </div>
            </div>
            <hr className="border-gray-200" />
            {/* INFO */}
            <div className="grid grid-cols-3 gap-2 m-4 text-center">
              <div>
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="text-sm font-semibold text-slate-800">
                  ${c.totalServicio}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">Pagado</p>
                <p className="text-sm font-semibold text-slate-800">
                  ${c.totalPagado}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">Debe</p>
                <p
                  className={`text-sm font-bold ${
                    c.totalServicio - c.totalPagado > 0
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  ${c.totalServicio - c.totalPagado}
                </p>
              </div>
            </div>
            <hr className="border-gray-200" />
            {/* FOOTER */}
            <button
              onClick={() => setCoberturaActiva(c)}
              className="w-40  mt-2 px-4 py-2 rounded-lg
               bg-[#1D4A74] text-white font-medium
               hover:bg-[#163a5a] transition"
            >
              Gestionar pagos
            </button>
            <DeletePermanentlyButton label="Eliminar cobertura" recordLabel={`Cobertura de ${c.servicio?.tipoServicio?.nombre || "servicio"} — ${c.servicio?.cliente?.nombreApellido || c._id.slice(-6)}`} endpoint={`/api/coberturas/${c._id}/permanent`} onDeleted={load} />
          </div>
        ))}
      </div>

      {filteredCoberturas.length === 0 && coberturas.length > 0 && <p className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">No hay coberturas que coincidan con estos filtros.</p>}

      {coberturaActiva && (
        <GestionPagosModal
          cobertura={coberturaActiva}
          onClose={() => setCoberturaActiva(null)}
          onUpdated={async () => {
            setCoberturaActiva(null);
            await load(); // recarga tabla
          }}
        />
      )}
    </div>
  );
}

function EstadoServicioBadge({ estado }) {
  if (!estado) {
    return (
      <span className="text-xs text-slate-500">Servicio no disponible</span>
    );
  }
  const classes = {
    activo: "bg-emerald-50 text-emerald-800",
    pausado: "bg-amber-50 text-amber-800",
    finalizado: "bg-slate-100 text-slate-700",
    cancelado: "bg-rose-50 text-rose-800",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${classes[estado] || "bg-slate-100 text-slate-700"}`}>
      Servicio {estado}
    </span>
  );
}
