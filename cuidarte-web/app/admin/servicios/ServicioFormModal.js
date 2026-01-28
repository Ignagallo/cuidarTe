// app/admin/servicios/ServicioFormModal.js
"use client";

import { useEffect, useState } from "react";

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
}) {
  const editMode = !!initialData;

  const [form, setForm] = useState({
    tipoServicio: "",
    cliente: "",
    profesional: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    diasSemana: [],
    indicaciones: "",
  });

  const [err, setErr] = useState("");

  /* ================= AUTOCOMPLETE CLIENTE ================= */
  const [queryCliente, setQueryCliente] = useState("");
  const [showClientes, setShowClientes] = useState(false);

  const clientesFiltrados = clientes.filter((c) =>
    c.nombreApellido.toLowerCase().includes(queryCliente.toLowerCase())
  );

  /* ================= AUTOCOMPLETE PROFESIONAL ================= */
  const [queryProfesional, setQueryProfesional] = useState("");
  const [showProfesionales, setShowProfesionales] = useState(false);

  const profesionalesFiltrados = profesionales.filter((p) =>
    `${p.nombreApellido} ${p.profesion || ""}`
      .toLowerCase()
      .includes(queryProfesional.toLowerCase())
  );

  /* ================= INIT ================= */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const toYMD = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
      setForm({
        tipoServicio: initialData.tipoServicio?._id || "",
        cliente: initialData.cliente?._id || "",
        profesional: initialData.profesional?._id || "",
        fechaInicio: toYMD(initialData.fechaInicio),
        fechaFin: toYMD(initialData.fechaFin),
        horaInicio: initialData.horaInicio || "",
        horaFin: initialData.horaFin || "",
        diasSemana: initialData.diasSemana || [],
        indicaciones: initialData.indicaciones || "",
      });
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
        indicaciones: "",
      });
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

    try {
      await onSaved(form);
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-3xl rounded-2xl shadow-2xl max-h-[90vh]
  flex flex-col animate-[fadeIn_0.2s_ease-out]">

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
                    ? clientes.find((c) => c._id === form.cliente)?.nombreApellido || ""
                    : queryCliente
                }
                onChange={(e) => {
                  setQueryCliente(e.target.value);
                  setForm({ ...form, cliente: "" });
                  setShowClientes(true);
                }}
                onFocus={() => setShowClientes(true)}
              />
              {showClientes && queryCliente && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-auto">
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
                    ? profesionales.find((p) => p._id === form.profesional)?.nombreApellido || ""
                    : queryProfesional
                }
                onChange={(e) => {
                  setQueryProfesional(e.target.value);
                  setForm({ ...form, profesional: "" });
                  setShowProfesionales(true);
                }}
                onFocus={() => setShowProfesionales(true)}
              />
              {showProfesionales && queryProfesional && (
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

          {/* CONFIGURACIÓN DEL SERVICIO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Configuración del servicio
            </h3>
            <select
              className={inputBase}
              value={form.tipoServicio}
              onChange={(e) =>
                setForm({ ...form, tipoServicio: e.target.value })
              }
            >
              <option value="">Seleccionar tipo de servicio…</option>
              {tiposServicio.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* PERÍODO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Período del servicio
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500">Fecha inicio</label>
                <input type="date" className={inputBase}
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Fecha fin</label>
                <input type="date" className={inputBase}
                  value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Hora inicio</label>
                <input type="time" className={inputBase}
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Hora fin</label>
                <input type="time" className={inputBase}
                  value={form.horaFin}
                  onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* DÍAS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Días de atención
            </h3>
            <p className="text-xs text-gray-500">
              Seleccioná los días de la semana en los que se presta el servicio
            </p>

            <div className="flex flex-wrap gap-2">
              {DIAS.map((d, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleDia(i)}
                  className={`
                    px-3 py-1.5 rounded-full border transition
                    ${
                      form.diasSemana.includes(i)
                        ? "bg-[#04BF8A] text-white border-[#04BF8A]"
                        : "bg-white text-[#1D4A74] border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* INDICACIONES */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Indicaciones
            </h3>
            <textarea
              className={`${inputBase} min-h-[90px]`}
              placeholder="Indicaciones adicionales para el profesional…"
              value={form.indicaciones}
              onChange={(e) =>
                setForm({ ...form, indicaciones: e.target.value })
              }
            />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="
                px-5 py-2.5 rounded-xl
                border border-gray-300
                bg-gray-50
                text-gray-700
                hover:bg-gray-100
                transition
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                px-5 py-2.5 rounded-xl
                bg-[#1D4A74]
                text-white font-medium
                shadow-md
                hover:bg-[#163a5c]
                hover:shadow-lg
                active:scale-[0.98]
                transition
              "
            >
              {editMode ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

