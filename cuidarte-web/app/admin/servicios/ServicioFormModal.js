// app/admin/servicios/ServicioFormModal.js
"use client";

import { useContext, useEffect, useState } from "react";
import TipoServicioModal from "./TipoServicioModal";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";
import AdminAuthContext from "@/components/AdminAuthContext";

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
  const { registerUnsavedForm } = useContext(AdminAuthContext);
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
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    registerUnsavedForm("servicio-form", open && dirty);
    return () => registerUnsavedForm("servicio-form", false);
  }, [dirty, open, registerUnsavedForm]);

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
    setDirty(false);
    setQueryCliente("");
    setQueryProfesional("");
  }, [open, initialData]);

  const toggleDia = (i) => {
    updateForm((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(i)
        ? prev.diasSemana.filter((d) => d !== i)
        : [...prev.diasSemana, i],
    }));
  };

  const updateForm = (updater) => {
    setForm(updater);
    setDirty(true);
  };

  const requestClose = () => {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Querés cerrar el formulario?")) return;
    onClose();
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
      setDirty(false);
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!open) return null;

  return (
    <Modal title={editMode ? "Editar servicio" : "Nuevo servicio"} onClose={requestClose} size="max-w-3xl" bodyClassName="min-h-0 overflow-y-auto p-0">
        <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
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
                  updateForm((current) => ({ ...current, cliente: "" }));
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
                        updateForm((current) => ({ ...current, cliente: c._id }));
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
                  updateForm((current) => ({ ...current, profesional: "" }));
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
                        updateForm((current) => ({ ...current, profesional: p._id }));
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
                      updateForm((current) => ({ ...current, tipoServicio: "" }));
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
                            updateForm((current) => ({ ...current, tipoServicio: t._id }));
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
                onChange={(e) => updateForm((current) => ({ ...current, estado: e.target.value }))}
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
                  updateForm((current) => ({ ...current, fechaInicio: e.target.value }))
                }
              />

              {!indefinido && (
                <input
                  type="date"
                  className={inputBase}
                  value={form.fechaFin}
                  onChange={(e) =>
                    updateForm((current) => ({ ...current, fechaFin: e.target.value }))
                  }
                />
              )}

              <input
                type="time"
                className={inputBase}
                value={form.horaInicio}
                onChange={(e) =>
                  updateForm((current) => ({ ...current, horaInicio: e.target.value }))
                }
              />

              <input
                type="time"
                className={inputBase}
                value={form.horaFin}
                onChange={(e) => updateForm((current) => ({ ...current, horaFin: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={indefinido}
                onChange={(e) => { setIndefinido(e.target.checked); setDirty(true); }}
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
              onChange={(e) => { setImporte(e.target.value); setDirty(true); }}
              className={inputBase} 
              placeholder="0"
            />
          </div>

          {/* INDICACIONES */}
          <textarea
            className={`${inputBase} min-h-[90px]`}
            placeholder="Indicaciones adicionales para el profesional…"
            value={form.indicaciones}
            onChange={(e) => updateForm((current) => ({ ...current, indicaciones: e.target.value }))}
          />

          {/* OBSERVACIONES INTERNAS */}
          <textarea
            className={`${inputBase} min-h-[90px]`}
            placeholder="Observaciones internas (solo administración)…"
            value={form.observacionesInternas}
            onChange={(e) =>
              updateForm((current) => ({ ...current, observacionesInternas: e.target.value }))
            }
          />

          {err && <p className="text-red-600 text-sm">{err}</p>}

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestClose}
              className="min-h-11 rounded-xl border border-gray-300 bg-gray-50 px-5 py-2.5 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[#1D4A74] px-5 py-2.5 font-medium text-white shadow-md hover:bg-[#163a5c] hover:shadow-lg active:scale-[0.98] transition"
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
            updateForm((f) => ({ ...f, tipoServicio: nuevo._id }));
          }}
          onUpdated={(actualizado) => {
            onTipoServicioUpdated?.(actualizado);
            updateForm((f) => ({ ...f, tipoServicio: actualizado._id }));
          }}
        />
    </Modal>
  );
}
