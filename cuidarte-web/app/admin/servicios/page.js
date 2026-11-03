// app/admin/servicios/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ServicioFormModal from "./ServicioFormModal";
import ActionMenu from "@/components/ActionMenu";
import DeletePermanentlyButton from "@/components/DeletePermanentlyButton";

export default function ServiciosAdminPage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [clientes, setClientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tiposServicio, setTiposServicio] = useState([]);

  /* ================= CARGA ================= */
  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/servicios");
      setServicios(Array.isArray(data) ? data : []);
      setErr("");
      return true;
    } catch (e) {
      setErr(e.message);
      setServicios([]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadAux = async () => {
    const [c, p] = await Promise.all([
      apiFetch("/api/clientes"),
      apiFetch("/api/profesionales"),
    ]);
    setClientes(c);
    setProfesionales(p);
  };
  const loadTiposServicio = async () => {
    const data = await apiFetch("/api/tipos-servicio");
    setTiposServicio(data);
  };

  useEffect(() => {
    load();
    loadAux();
    loadTiposServicio();
  }, []);

  /* ================= FILTRO ================= */
  const filtered = useMemo(() => {
    return servicios.filter((s) =>
      (estadoFilter === "todos" || s.estado === estadoFilter) &&
      `${s.tipoServicio?.nombre}
       ${s.cliente?.nombreApellido}
       ${s.profesional?.nombreApellido}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [servicios, search, estadoFilter]);

  /* ================= CRUD ================= */
  const save = async (data) => {
    if (editing) {
      await apiFetch(`/api/servicios/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await apiFetch("/api/servicios", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    load();
  };

  const cancelar = async (id) => {
    if (!confirm("¿Cancelar este servicio?")) return;
    await apiFetch(`/api/servicios/${id}`, { method: "DELETE" });
    load();
  };
  /* ================= HANDLERS TIPOS DE SERVICIO ================= */
  const handleTipoServicioCreated = (nuevo) => {
    setTiposServicio((prev) => [...prev, nuevo]);
  };

  const handleTipoServicioUpdated = (actualizado) => {
    setTiposServicio((prev) =>
      prev.map((t) => (t._id === actualizado._id ? actualizado : t)),
    );
  };

  const handleTipoServicioDeleted = (id) => {
    setTiposServicio((prev) =>
      prev.map((t) => (t._id === id ? { ...t, activo: false } : t)),
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1D4A74]">Servicios</h1>
        {/* BUSCADOR */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            placeholder="Buscar por cliente, profesional o tipo de servicio…"
            aria-label="Buscar servicios"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-gray-300 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A] focus:border-[#04BF8A]"
          />
          <label className="sr-only" htmlFor="filtro-estado-servicio">Filtrar servicios por estado</label>
          <select
            id="filtro-estado-servicio"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="
            px-5 py-2.5 rounded-xl
            bg-[#1D4A74] text-white font-medium
            shadow-md
            hover:bg-[#163a5c]
            hover:shadow-lg
            active:scale-[0.98]
            transition
          "
        >
          + Nuevo servicio
        </button>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {loading && <p className="text-gray-500">Cargando servicios…</p>}
      {!loading && <p className="text-sm text-slate-500">Mostrando {filtered.length} de {servicios.length} servicios</p>}
      {!loading && servicios.length > 0 && filtered.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">No hay servicios que coincidan con estos filtros.</p>}

      {/* ================= TABLA DESKTOP ================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-[#1D4A74] text-white">
            <tr>
              <Th>Servicio</Th>
              <Th>Cliente</Th>
              <Th>Profesional</Th>
              <Th>Días</Th>
              <Th>Horario</Th>
              <Th>Período</Th>
              <Th>Estado</Th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s._id}
                className="border-t hover:bg-[#1D4A74]/5 transition-colors"
              >
                <Td className="font-medium">{s.tipoServicio?.nombre}</Td>
                <Td>{s.cliente?.nombreApellido}</Td>
                <Td>{s.profesional?.nombreApellido}</Td>
                <Td>{formatDias(s.diasSemana)}</Td>
                <Td>
                  {s.horaInicio} – {s.horaFin}
                </Td>
                <Td>
                  {formatFecha(s.fechaInicio)}{" "}
                  {s.fechaFin ? `→ ${formatFecha(s.fechaFin)}` : "→ Indefinido"}
                </Td>
                <Td>
                  <EstadoBadge estado={s.estado} />
                </Td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                  <ActionMenu
                    actions={[
                      {
                        label: "Editar",
                        icon: "✏️",
                        onClick: () => {
                          setEditing(s);
                          setModalOpen(true);
                        },
                        className:
                          "bg-blue-100 text-blue-700 hover:bg-blue-200",
                      },
                      {
                        label: "Cancelar",
                        icon: "⛔",
                        onClick: () => cancelar(s._id),
                        className: "bg-red-100 text-red-700 hover:bg-red-200",
                      },
                    ]}
                  />
                  <DeletePermanentlyButton label="Eliminar definitivamente" recordLabel={`${s.tipoServicio?.nombre || "Servicio"} — ${s.cliente?.nombreApellido || "sin cliente"}`} endpoint={`/api/servicios/${s._id}/permanent`} onDeleted={load} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CARDS MOBILE ================= */}
      <div className="grid gap-4 md:hidden">
        {filtered.map((s, idx) => (
          <div
            key={s._id}
            className={`
        rounded-2xl shadow-md
        p-4 space-y-3
        transition hover:shadow-lg
        ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fbfd]"}
      `}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#1D4A74] font-semibold text-base">
                  {s.tipoServicio?.nombre || "Servicio"}
                </h3>
              </div>
              <EstadoBadge estado={s.estado} />
            </div>

            <hr className="border-gray-200" />

            {/* CLIENTE / PROFESIONAL */}
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-medium text-[#1D4A74]">👤 Cliente:</span>{" "}
                {s.cliente?.nombreApellido}
              </div>
              <div>
                <span className="font-medium text-[#1D4A74]">
                  🧑 Profesional:
                </span>{" "}
                {s.profesional?.nombreApellido}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* HORARIO */}
            <div className="flex justify-between text-sm text-gray-600">
              <div>📅 {formatDias(s.diasSemana)}</div>
              <div>
                ⏰ {s.horaInicio} – {s.horaFin}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              🗓 {formatFecha(s.fechaInicio)}
              {s.fechaFin ? ` → ${formatFecha(s.fechaFin)}` : " → Indefinido"}
            </div>

            <hr className="border-gray-200" />

            {/* ACCIONES */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(s);
                  setModalOpen(true);
                }}
                className="
            flex-1 px-3 py-2 rounded-lg
            bg-blue-100 text-blue-700 font-medium
            hover:bg-blue-200
            active:scale-[0.97]
            transition
          "
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => cancelar(s._id)}
                className="
            flex-1 px-3 py-2 rounded-lg
            bg-red-100 text-red-700 font-medium
            hover:bg-red-200
            active:scale-[0.97]
            transition
          "
              >
                ⛔ Cancelar
              </button>
              <DeletePermanentlyButton label="Eliminar definitivamente" recordLabel={`${s.tipoServicio?.nombre || "Servicio"} — ${s.cliente?.nombreApellido || "sin cliente"}`} endpoint={`/api/servicios/${s._id}/permanent`} onDeleted={load} />
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <ServicioFormModal
          open={modalOpen}
          initialData={editing}
          onClose={() => setModalOpen(false)}
          onSaved={save}
          clientes={clientes}
          profesionales={profesionales}
          tiposServicio={tiposServicio}
          onTipoServicioCreated={handleTipoServicioCreated}
          onTipoServicioUpdated={handleTipoServicioUpdated}
          onTipoServicioDeleted={handleTipoServicioDeleted}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTES AUX ================= */

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left font-semibold tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-2 text-[#1D4A74] ${className}`}>{children}</td>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    activo: "bg-green-100 text-green-700",
    pausado: "bg-yellow-100 text-yellow-700",
    finalizado: "bg-gray-200 text-gray-700",
    cancelado: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${map[estado]}`}
    >
      {estado}
    </span>
  );
}

function formatFecha(d) {
  return new Date(d).toLocaleDateString();
}

function formatDias(dias = []) {
  const map = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return dias.map((d) => map[d]).join(", ");
}
