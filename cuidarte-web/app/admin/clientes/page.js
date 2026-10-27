// app/admin/clientes/page.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ClienteModal from "./ClienteModal";
import DeletePermanentlyButton from "@/components/DeletePermanentlyButton";
import { apiFetch } from "@/lib/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/clientes?includeInactive=true");
      setClientes(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      setError(err.message || "No se pudieron cargar los clientes");
      setClientes([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const desactivarCliente = async (cliente) => {
    if (!confirm(`¿Desactivar a ${cliente.nombreApellido}?`)) return;
    try {
      await apiFetch(`/api/clientes/${cliente._id}`, { method: "DELETE" });
      await fetchClientes();
    } catch (e) {
      setError(e.message || "No se pudo desactivar el cliente");
    }
  };

  const filteredClientes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    if (!query) return clientes;
    return clientes.filter((cliente) =>
      [cliente.nombreApellido, cliente.dni, cliente.telefono]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("es").includes(query)),
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D4A74]">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">Administrá perfiles y accesos de clientes.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <label className="sr-only" htmlFor="buscar-clientes">Buscar clientes</label>
          <input
            id="buscar-clientes"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, DNI o teléfono"
            className="min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[#1D4A74] outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] sm:w-72"
          />

          <button
            type="button"
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
            transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-2
          "
          >
            + Nuevo cliente
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {loading ? (
        <p role="status" className="py-10 text-center text-slate-600">Cargando clientes…</p>
      ) : filteredClientes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-sm">
          {clientes.length === 0 ? "Todavía no hay clientes registrados." : "No hay clientes que coincidan con la búsqueda."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1D4A74] text-white">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Cliente</th>
                  <th scope="col" className="px-5 py-4 font-semibold">DNI</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Teléfono</th>
                  <th scope="col" className="px-5 py-4 text-center font-semibold">Estado</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-[#1D4A74]">{cliente.nombreApellido}</td>
                    <td className="px-5 py-4 text-slate-700">{cliente.dni}</td>
                    <td className="px-5 py-4 text-slate-700">{cliente.telefono || "—"}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge active={cliente.activo} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => { setEditing(cliente); setOpen(true); }} className="rounded-lg px-3 py-2 text-[#1D4A74] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Editar</button>
                        {cliente.activo && <button type="button" onClick={() => desactivarCliente(cliente)} className="rounded-lg px-3 py-2 text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Desactivar</button>}
                        <DeletePermanentlyButton label="Eliminar definitivamente" recordLabel={cliente.nombreApellido} endpoint={`/api/clientes/${cliente._id}/permanent`} onDeleted={fetchClientes} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 md:hidden">
            {filteredClientes.map((cliente) => (
              <li key={cliente._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold text-[#1D4A74]">{cliente.nombreApellido}</h2>
                    <p className="mt-1 text-sm text-slate-600">DNI {cliente.dni} · {cliente.telefono || "Sin teléfono"}</p>
                  </div>
                  <StatusBadge active={cliente.activo} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => { setEditing(cliente); setOpen(true); }} className="min-h-10 rounded-lg px-3 py-2 text-sm text-[#1D4A74] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Editar</button>
                  {cliente.activo && <button type="button" onClick={() => desactivarCliente(cliente)} className="min-h-10 rounded-lg px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Desactivar</button>}
                  <DeletePermanentlyButton label="Eliminar definitivamente" recordLabel={cliente.nombreApellido} endpoint={`/api/clientes/${cliente._id}/permanent`} onDeleted={fetchClientes} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

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

function StatusBadge({ active }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
