// app/admin/clientes/page.js
"use client";

import { useEffect, useState } from "react";
import ClienteModal from "./ClienteModal";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchClientes = async () => {
    const res = await fetch(`${API}/api/clientes`, {
      credentials: "include",
    });
    const data = await res.json();
    setClientes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const desactivarCliente = async (id) => {
    if (!confirm("¿Desactivar este cliente?")) return;

    try {
      const res = await fetch(`${API}/api/clientes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Error al desactivar cliente");
      }

      fetchClientes();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#1D4A74]">Clientes</h1>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="
            px-4 py-2
            rounded-xl
            bg-[#1D4A74]
            text-white
            shadow-md
            hover:bg-[#163a5c]
            transition
          "
        >
          Nuevo cliente
        </button>
      </div>

      {/* Tabla */}
      <div className="
        bg-white
        rounded-2xl
        shadow-lg
        border border-gray-100
        overflow-hidden
      ">
        <table className="w-full text-sm">
          <thead className="bg-[#1D4A74] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">
                Cliente
              </th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">
                DNI
              </th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">
                Teléfono
              </th>
              <th className="px-4 py-3 text-center font-semibold tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">
                Profesionales / Servicios
              </th>
              <th className="px-4 py-3 text-right font-semibold tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((c) => (
              <tr
                key={c._id}
                className="border-t hover:bg-[#1D4A74]/5 transition-colors"
              >
                {/* Cliente */}
                <td className="px-4 py-2 text-[#1D4A74] font-medium">
                  {c.nombreApellido}
                </td>

                {/* DNI */}
                <td className="px-4 py-2 text-[#1D4A74]">
                  {c.dni}
                </td>

                {/* Teléfono */}
                <td className="px-4 py-2 text-[#1D4A74]">
                  {c.telefono || "—"}
                </td>

                {/* Estado */}
                <td className="px-4 py-2 text-center">
                  <span
                    className={`
                      px-2 py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${
                        c.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                {/* Profesionales / Servicios */}
                <td className="px-4 py-2 text-gray-400 italic">
                  Sin servicios
                </td>

                {/* Acciones */}
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setOpen(true);
                    }}
                    className="
                      px-2 py-1
                      rounded-md
                      text-sm
                      text-[#1D4A74]
                      hover:bg-[#1D4A74]/10
                      transition
                    "
                  >
                    Editar
                  </button>

                  {c.activo && (
                    <button
                      onClick={() => desactivarCliente(c._id)}
                      className="
                        px-2 py-1
                        rounded-md
                        text-sm
                        text-red-600
                        hover:bg-red-50
                        transition
                      "
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500 italic"
                >
                  No hay clientes cargados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <ClienteModal
          editing={editing}
          onClose={() => setOpen(false)}
          onSaved={fetchClientes}
        />
      )}
    </div>
  );
}
