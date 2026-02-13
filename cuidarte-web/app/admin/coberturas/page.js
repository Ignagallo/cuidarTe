// admin/coberturas/page.js
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import GestionPagosModal from "./GestionPagosModal";
import EstadoCoberturaBadge from "./EstadoCoberturaBadge";


export default function CoberturasPage() {
  const [coberturas, setCoberturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [coberturaActiva, setCoberturaActiva] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/api/coberturas");
      setCoberturas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCoberturas([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredCoberturas = coberturas.filter((c) => {
    const q = search.toLowerCase();

    const cliente = c.servicio?.cliente?.nombreApellido?.toLowerCase() || "";

    const servicio = c.servicio?.tipoServicio?.nombre?.toLowerCase() || "";

    const estado = c.estado?.toLowerCase() || "";

    return cliente.includes(q) || servicio.includes(q) || estado.includes(q);
  });

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Cargando coberturas…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold text-[#1D4A74]">
        Coberturas de servicios
      </h1>
      {/* BUSCADOR */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar por cliente, servicio o estado…"
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
      </div>
      </div>
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

                <td className="px-4 py-2 text-right">${c.totalServicio}</td>

                <td className="px-4 py-2 text-right">${c.totalPagado}</td>

                <td className="px-4 py-2 text-center">
                  <EstadoCoberturaBadge estado={c.estado} />
                </td>

                <td className="px-4 py-2 text-center">
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
                <EstadoCoberturaBadge estado={c.estado} />
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
          </div>
        ))}
      </div>

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
