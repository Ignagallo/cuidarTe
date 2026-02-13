// app/admin/servicios/ServicioFormModal.js
"use client";

import { useEffect, useState } from "react";
import TipoServicioModal from "./TipoServicioModal";
import { apiFetch } from "@/lib/api";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const inputBase = `
  w-full px-4 py-2.5 rounded-xl
  border border-gray-300
  bg-white
  text-[#1D4A74]
  transition
  focus:outline-none
  focus:ring-2 focus:ring-[#04BF8A]
  focus:border-[#04BF8A]
  hover:border-gray-400
`;

export default function ServicioFormModal({
  open,
  onClose,
  onSaved,
  initialData,
  clientes = [],
  profesionales = [],
  tiposServicio = [],
  onTipoServicioCreated,
  onTipoServicioUpdated,
  onTipoServicioDeleted,
}) {
  const editMode = !!initialData;
  const [importe, setImporte] = useState(0);
  const [form, setForm] = useState({
    tipoServicio: "",
    cliente: "",
    profesional: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    diasSemana: [],
    estado: "activo",
    indicaciones: "",
    observacionesInternas: "",
    importe: Number(importe) || 0,
  });

  const [indefinido, setIndefinido] = useState(false);
  const [err, setErr] = useState("");

  /* ================= MODAL TIPO SERVICIO ================= */
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);

  /* ================= AUTOCOMPLETE TIPO SERVICIO ================= */
  const [queryTipo, setQueryTipo] = useState("");
  const [showTipos, setShowTipos] = useState(false);
  const openEditarTipo = (tipo) => {
    setTipoEditando(tipo);
    setShowTipoModal(true);
  };
  const eliminarTipo = async (id) => {
    if (!confirm("¿Desactivar este tipo de servicio?")) return;

    await apiFetch(`/api/tipos-servicio/${id}`, {
      method: "DELETE",
    });

    onTipoServicioDeleted?.(id);
  };

  const tiposFiltrados = tiposServicio.filter((t) =>
    t.nombre.toLowerCase().includes(queryTipo.toLowerCase()),
  );

  /* ================= AUTOCOMPLETE CLIENTE ================= */
  const [queryCliente, setQueryCliente] = useState("");
  const [showClientes, setShowClientes] = useState(false);

  const clientesFiltrados = clientes.filter((c) =>
    c.nombreApellido.toLowerCase().includes(queryCliente.toLowerCase()),
  );

  /* ================= AUTOCOMPLETE PROFESIONAL ================= */
  const [queryProfesional, setQueryProfesional] = useState("");
  const [showProfesionales, setShowProfesionales] = useState(false);

  const profesionalesFiltrados = profesionales.filter((p) =>
    `${p.nombreApellido} ${p.profesion || ""}`
      .toLowerCase()
      .includes(queryProfesional.toLowerCase()),
  );

  /* ================= INIT ================= */
  useEffect(() => {
    if (!open) return;

    const toYMD = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

    if (initialData) {
      setForm({
        tipoServicio: initialData.tipoServicio?._id || "",
        cliente: initialData.cliente?._id || "",
        profesional: initialData.profesional?._id || "",
        fechaInicio: toYMD(initialData.fechaInicio),
        fechaFin: toYMD(initialData.fechaFin),
        horaInicio: initialData.horaInicio || "",
        horaFin: initialData.horaFin || "",
        diasSemana: initialData.diasSemana || [],
        estado: initialData.estado || "activo",
        indicaciones: initialData.indicaciones || "",
        observacionesInternas: initialData.observacionesInternas || "",
      });
      setImporte(initialData.importe ?? 0);
      setIndefinido(!initialData.fechaFin);
    } else {
      setForm({
        tipoServicio: "",
        cliente: "",
        profesional: "",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        diasSemana: [],
        estado: "activo",
        indicaciones: "",
        observacionesInternas: "",
      });
      setIndefinido(false);
      setImporte(0);
    }

    setErr("");
    setQueryCliente("");
    setQueryProfesional("");
  }, [open, initialData]);

  const toggleDia = (i) => {
    setForm((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(i)
        ? prev.diasSemana.filter((d) => d !== i)
        : [...prev.diasSemana, i],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.cliente || !form.profesional || !form.tipoServicio) {
      setErr("Cliente, profesional y tipo de servicio son obligatorios.");
      return;
    }

    if (!form.fechaInicio) {
      setErr("La fecha de inicio es obligatoria.");
      return;
    }

    if (!indefinido && form.fechaFin && form.fechaFin < form.fechaInicio) {
      setErr("La fecha de fin no puede ser menor a la de inicio.");
      return;
    }

    if (!form.horaInicio || !form.horaFin) {
      setErr("Debe completar el horario.");
      return;
    }

    if (form.horaFin <= form.horaInicio) {
      setErr("La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    if (!form.diasSemana.length) {
      setErr("Debe seleccionar al menos un día de atención.");
      return;
    }

    try {
      await onSaved({
        ...form,
        fechaFin: indefinido ? null : form.fechaFin,
        importe: Number(importe) || 0
      });
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#1D4A74]">
            {editMode ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* ================= BODY ================= */}
        <form onSubmit={submit} className="p-6 space-y-6 overflow-y-auto">
          {/* CLIENTE / PROFESIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CLIENTE */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Cliente
              </label>
              <input
                className={inputBase}
                placeholder="Buscar cliente por nombre…"
                value={
                  form.cliente
                    ? clientes.find((c) => c._id === form.cliente)
                        ?.nombreApellido || ""
                    : queryCliente
                }
                onChange={(e) => {
                  setQueryCliente(e.target.value);
                  setForm({ ...form, cliente: "" });
                  setShowClientes(true);
                }}
                onFocus={() => setShowClientes(true)}
                onBlur={() => {
                  setTimeout(() => setShowClientes(false), 150);
                }}
              />
              {showClientes && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-[220px] overflow-y-auto">
                  {clientesFiltrados.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Sin resultados
                    </div>
                  )}
                  {clientesFiltrados.map((c) => (
                    <button
                      type="button"
                      key={c._id}
                      onClick={() => {
                        setForm({ ...form, cliente: c._id });
                        setQueryCliente("");
                        setShowClientes(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#1D4A74]/10 text-[#1D4A74]"
                    >
                      {c.nombreApellido}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PROFESIONAL */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Profesional
              </label>
              <input
                className={inputBase}
                placeholder="Buscar profesional por nombre…"
                value={
                  form.profesional
                    ? profesionales.find((p) => p._id === form.profesional)
                        ?.nombreApellido || ""
                    : queryProfesional
                }
                onChange={(e) => {
                  setQueryProfesional(e.target.value);
                  setForm({ ...form, profesional: "" });
                  setShowProfesionales(true);
                }}
                onFocus={() => setShowProfesionales(true)}
                onBlur={() => {
                  setTimeout(() => setShowProfesionales(false), 150);
                }}
              />
              {showProfesionales && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-auto">
                  {profesionalesFiltrados.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Sin resultados
                    </div>
                  )}
                  {profesionalesFiltrados.map((p) => (
                    <button
                      type="button"
                      key={p._id}
                      onClick={() => {
                        setForm({ ...form, profesional: p._id });
                        setQueryProfesional("");
                        setShowProfesionales(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#1D4A74]/10 text-[#1D4A74]"
                    >
                      {p.nombreApellido} — {p.profesion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SELECTOR SERVICIO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Tipo de servicio
            </h3>

            <div className="flex gap-2">
              <div className="relative w-full">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo de servicio
                </label>

                <div className="flex gap-2">
                  <input
                    className={inputBase}
                    placeholder="Seleccionar tipo de servicio…"
                    value={
                      form.tipoServicio
                        ? tiposServicio.find((t) => t._id === form.tipoServicio)
                            ?.nombre || ""
                        : queryTipo
                    }
                    onChange={(e) => {
                      setQueryTipo(e.target.value);
                      setForm({ ...form, tipoServicio: "" });
                      setShowTipos(true);
                    }}
                    onFocus={() => setShowTipos(true)}
                    onBlur={() => setTimeout(() => setShowTipos(false), 150)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowTipoModal(true)}
                    className="
                      px-4 rounded-xl
                      bg-[#04BF8A] text-white
                      hover:bg-[#00a884]
                      transition
                    "
                    title="Crear nuevo tipo"
                  >
                    +
                  </button>
                </div>

                {showTipos && (
                  <div
                    className="
                      absolute z-10 w-full mt-1
                      bg-white border rounded-xl shadow-lg
                      max-h-[220px] overflow-y-auto
                    "
                  >
                    {tiposFiltrados.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Sin resultados
                      </div>
                    )}

                    {tiposFiltrados.map((t) => (
                      <div
                        key={t._id}
                        className="
                        flex items-center justify-between
                        px-4 py-2
                        hover:bg-[#1D4A74]/10
                        transition
                        group
                      "
                      >
                        {/* SELECT */}
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, tipoServicio: t._id });
                            setQueryTipo("");
                            setShowTipos(false);
                          }}
                          className="
                            flex items-center gap-2
                            text-left flex-1
                            text-[#1D4A74]
                          "
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: t.color }}
                          />
                          <span>{t.nombre}</span>
                        </button>

                        {/* ACTIONS */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() => openEditarTipo(t)}
                            className="
                              p-1 rounded
                              text-blue-600
                              hover:bg-blue-50
                            "
                            title="Editar tipo"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() => eliminarTipo(t._id)}
                            className="
                              p-1 rounded
                              text-red-600
                              hover:bg-red-50
                            "
                            title="Desactivar tipo"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <select
                className={inputBase}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            )}
          </div>

          {/* PERÍODO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Período del servicio
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="date"
                className={inputBase}
                value={form.fechaInicio}
                onChange={(e) =>
                  setForm({ ...form, fechaInicio: e.target.value })
                }
              />

              {!indefinido && (
                <input
                  type="date"
                  className={inputBase}
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm({ ...form, fechaFin: e.target.value })
                  }
                />
              )}

              <input
                type="time"
                className={inputBase}
                value={form.horaInicio}
                onChange={(e) =>
                  setForm({ ...form, horaInicio: e.target.value })
                }
              />

              <input
                type="time"
                className={inputBase}
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={indefinido}
                onChange={(e) => setIndefinido(e.target.checked)}
              />
              Servicio sin fecha de finalización
            </label>
          </div>

          {/* DÍAS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Días de atención
            </h3>

            <div className="flex flex-wrap gap-2">
              {DIAS.map((d, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleDia(i)}
                  className={`px-3 py-1.5 rounded-full border transition ${
                    form.diasSemana.includes(i)
                      ? "bg-[#04BF8A] text-white border-[#04BF8A]"
                      : "bg-white text-[#1D4A74] border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Importe cotizado
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              className={inputBase} 
              placeholder="0"
            />
          </div>

          {/* INDICACIONES */}
          <textarea
            className={`${inputBase} min-h-[90px]`}
            placeholder="Indicaciones adicionales para el profesional…"
            value={form.indicaciones}
            onChange={(e) => setForm({ ...form, indicaciones: e.target.value })}
          />

          {/* OBSERVACIONES INTERNAS */}
          <textarea
            className={`${inputBase} min-h-[90px]`}
            placeholder="Observaciones internas (solo administración)…"
            value={form.observacionesInternas}
            onChange={(e) =>
              setForm({
                ...form,
                observacionesInternas: e.target.value,
              })
            }
          />

          {err && <p className="text-red-600 text-sm">{err}</p>}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1D4A74] text-white font-medium shadow-md hover:bg-[#163a5c] hover:shadow-lg active:scale-[0.98] transition"
            >
              {editMode ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
        <TipoServicioModal
          open={showTipoModal}
          initialData={tipoEditando}
          onClose={() => {
            setShowTipoModal(false);
            setTipoEditando(null);
          }}
          onCreated={(nuevo) => {
            onTipoServicioCreated?.(nuevo);
            setForm((f) => ({ ...f, tipoServicio: nuevo._id }));
          }}
          onUpdated={(actualizado) => {
            onTipoServicioUpdated?.(actualizado);
            setForm((f) => ({ ...f, tipoServicio: actualizado._id }));
          }}
        />
      </div>
    </div>
  );
}
