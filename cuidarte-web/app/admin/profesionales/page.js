"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProfesionalModal from "./ProfesionalModal";

export default function ProfesionalesPage() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("cards");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setList(await apiFetch("/api/profesionales"));
  };

  useEffect(() => {
    load();
  }, []);

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este profesional?")) return;
    await apiFetch(`/api/profesionales/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1D4A74]">Profesionales</h1>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-[#04BF8A] text-white px-4 py-2 rounded-xl hover:bg-[#00A884] transition"
        >
          + Nuevo profesional
        </button>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("cards")}
          className={`
      px-4 py-2 rounded-xl transition
      ${
        view === "cards"
          ? "bg-[#04BF8A] text-white"
          : "bg-[#1D4A74] text-white hover:bg-[#163a5c]"
      }
    `}
        >
          Tarjetas
        </button>

        <button
          onClick={() => setView("table")}
          className={`
      px-4 py-2 rounded-xl transition
      ${
        view === "table"
          ? "bg-[#04BF8A] text-white"
          : "bg-[#1D4A74] text-white hover:bg-[#163a5c]"
      }
    `}
        >
          Tabla
        </button>
      </div>

      {/* TABLE */}
      {view === "table" && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1D4A74] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Profesión</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-[#1D4A74]/5 transition-colors"
                >
                  <td className="px-4 py-2 text-[#1D4A74]">
                    {p.nombreApellido}
                  </td>
                  <td className="px-4 py-2 text-[#1D4A74]">{p.profesion}</td>
                  <td className="px-4 py-2 text-[#1D4A74]">
                    {p.telefono || "—"}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2 text-[#1D4A74]">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      className="px-2 py-1 rounded-md text-sm text-[#1D4A74] hover:bg-[#1D4A74]/10 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => desactivar(p._id)}
                      className="px-2 py-1 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400 italic"
                  >
                    No hay profesionales cargados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS */}
      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div
              key={p._id}
              className="
                bg-white
                rounded-2xl
                shadow-lg
                border border-gray-100
                p-5
                hover:shadow-xl
                transition-shadow
              "
            >
              {p.fotoUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE}${p.fotoUrl}`}
                  alt={p.nombreApellido}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-gray-100 grid place-items-center text-gray-400 text-xs">
                  Sin foto
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#1D4A74]">
                {p.nombreApellido}
              </h3>
              <p className="text-sm text-gray-500">{p.profesion}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#1D4A74] text-white hover:bg-[#163a5c] transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => desactivar(p._id)}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="col-span-full text-gray-400 italic text-center">
              No hay profesionales cargados
            </div>
          )}
        </div>
      )}

      <ProfesionalModal
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
