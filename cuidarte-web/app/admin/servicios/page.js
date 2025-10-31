"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

const TIPOS = [
  { v: "asistencia_diaria", label: "Asistencia diaria" },
  { v: "acompanamiento", label: "Acompañamiento" },
  { v: "kinesiologia", label: "Kinesiología" },
  { v: "enfermeria", label: "Enfermería" },
  { v: "otro", label: "Otro" },
];

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/* ================= Helpers de fechas ================= */
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
  if (!serv?.fechaInicio || !serv?.fechaFin || !Array.isArray(serv?.diasSemana)) return [];
  const start = startOfDayLocal(serv.fechaInicio);
  const end   = startOfDayLocal(serv.fechaFin);
  const out = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (serv.diasSemana.includes(d.getDay())) out.push(ymdLocal(d)); // ← clave local YYYY-MM-DD
  }
  return out;
}
/* ================= Modal de Cobertura ================= */
function CoberturaModal({ servicio, onClose, onSaved }) {
  const base = useMemo(() => {
    const occ = rangoOcurrencias(servicio);
    const m = new Map(occ.map((f) => [f, false]));
    (servicio.coberturaDias || []).forEach((cd) => {
      if (!cd?.fecha) return;
      const key = ymdLocal(cd.fecha);
      if (m.has(key)) m.set(key, cd.cubierto === true);
    });
    return m;
  }, [servicio]);

  const [estado, setEstado] = useState(base);
  const [err, setErr] = useState("");

  const toggle = (fecha) => {
    setEstado((prev) => {
      const n = new Map(prev);
      n.set(fecha, !n.get(fecha));
      return n;
    });
  };

  const marcarPorcentaje = (pct) => {
    const arr = Array.from(estado.keys()).sort();
    const n = Math.round(arr.length * pct);
    const nuevo = new Map(estado);
    arr.forEach((f, i) => nuevo.set(f, i < n));
    setEstado(nuevo);
  };

  const guardar = async () => {
    try {
      setErr("");
      const dias = Array.from(estado.entries()).map(([fecha, cubierto]) => ({ fecha, cubierto }));
      await apiFetch(`/api/servicios/${servicio._id}/cobertura`, {
        method: "PATCH",
        body: JSON.stringify({ dias }),
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
  };

  const total = estado.size;
  const cubiertos = Array.from(estado.values()).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-3xl p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1D4A74]">Cobertura de pagos</h3>
            <p className="text-xs text-gray-500">
              Rango: {new Date(servicio.fechaInicio).toLocaleDateString()} — {new Date(servicio.fechaFin).toLocaleDateString()} • Días: {(servicio.diasSemana || []).map((i) => DIAS[i]).join(", ")}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Cerrar">✕</button>
        </div>

        <div className="mt-3 text-sm text-[#1D4A74]">
          Marcados: <strong>{cubiertos}</strong> / {total} &nbsp;({Math.round((cubiertos / Math.max(1, total)) * 100)}%)
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => marcarPorcentaje(0.25)} className="px-3 py-1 border rounded">25%</button>
          <button onClick={() => marcarPorcentaje(0.50)} className="px-3 py-1 border rounded">50%</button>
          <button onClick={() => marcarPorcentaje(0.75)} className="px-3 py-1 border rounded">75%</button>
          <button onClick={() => marcarPorcentaje(1)} className="px-3 py-1 border rounded">100%</button>
          <button onClick={() => marcarPorcentaje(0)} className="px-3 py-1 border rounded">0%</button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Array.from(estado.keys()).sort().map((f) => {
            const ok = estado.get(f);
            return (
              <button
                key={f}
                onClick={() => toggle(f)}
                title={ok ? "Pagado" : "Impago"}
                className={`text-xs sm:text-sm px-2 py-2 rounded border transition ${
                  ok ? "bg-[#04BF8A] text-white border-[#04BF8A]" : "bg-red-50 text-red-700 border-red-300"
                }`}
              >
                {new Date(`${f}T00:00:00`).toLocaleDateString()}
              </button>
            );
          })}
        </div>

        {err && <p className="mt-4 text-red-600">{err}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={guardar} className="px-4 py-2 rounded bg-[#04BF8A] text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
}

/* ================= Modal de Crear/Editar Servicio ================= */
function ServiceFormModal({ open, onClose, onSaved, initialData, clientes, profes }) {
  const editMode = !!initialData;
  const [form, setForm] = useState({
    tipo: "asistencia_diaria",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    diasSemana: [],
    cliente: "",
    profesional: "",
    indicaciones: "",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const d = initialData;
      const toYMD = (x) => (x ? new Date(x).toISOString().slice(0, 10) : "");
      setForm({
        tipo: d.tipo || "asistencia_diaria",
        fechaInicio: toYMD(d.fechaInicio),
        fechaFin: toYMD(d.fechaFin),
        horaInicio: d.horaInicio || "",
        horaFin: d.horaFin || "",
        diasSemana: Array.isArray(d.diasSemana) ? d.diasSemana : [],
        cliente: d.cliente?._id || d.cliente || "",
        profesional: d.profesional?._id || d.profesional || "",
        indicaciones: d.indicaciones || "",
      });
    } else {
      setForm({
        tipo: "asistencia_diaria",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        diasSemana: [],
        cliente: "",
        profesional: "",
        indicaciones: "",
      });
    }
    setErr("");
  }, [open, initialData]);

  const toggleDia = (i) => {
    setForm((prev) => {
      const has = prev.diasSemana.includes(i);
      return { ...prev, diasSemana: has ? prev.diasSemana.filter((d) => d !== i) : [...prev.diasSemana, i] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (editMode) {
        await apiFetch(`/api/servicios/${initialData._id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/api/servicios", { method: "POST", body: JSON.stringify(form) });
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-3xl p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1D4A74]">
            {editMode ? "Editar servicio" : "Nuevo servicio"}
          </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-[#1D4A74]">
          <select className="border rounded px-3 py-2" value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS.map((t) => (
              <option key={t.v} value={t.v}>{t.label}</option>
            ))}
          </select>

          <input className="border rounded px-3 py-2" type="date" value={form.fechaInicio}
                 onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
          <input className="border rounded px-3 py-2" type="date" value={form.fechaFin}
                 onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} required />
          <input className="border rounded px-3 py-2" type="time" value={form.horaInicio}
                 onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
          <input className="border rounded px-3 py-2" type="time" value={form.horaFin}
                 onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />

          <div className="md:col-span-4 flex flex-wrap gap-2">
            {DIAS.map((d, i) => (
              <button
                type="button"
                key={i}
                onClick={() => toggleDia(i)}
                className={`px-3 py-1 rounded border ${
                  form.diasSemana.includes(i) ? "bg-[#04BF8A] text-white border-[#04BF8A]" : "bg-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <select className="border rounded px-3 py-2" value={form.cliente} required
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}>
            <option value="">Cliente…</option>
            {clientes.map((c) => (
              <option key={c._id} value={c._id}>{c.nombreApellido}</option>
            ))}
          </select>

          <select className="border rounded px-3 py-2" value={form.profesional} required
                  onChange={(e) => setForm({ ...form, profesional: e.target.value })}>
            <option value="">Profesional…</option>
            {profes.map((p) => (
              <option key={p._id} value={p._id}>{p.nombreApellido} — {p.profesion}</option>
            ))}
          </select>

          <input className="md:col-span-4 border rounded px-3 py-2" placeholder="Indicaciones"
                 value={form.indicaciones} onChange={(e) => setForm({ ...form, indicaciones: e.target.value })} />

          {err && <p className="text-red-600 md:col-span-4">{err}</p>}

          <div className="md:col-span-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button className="px-4 py-2 rounded bg-[#04BF8A] text-white">
              {editMode ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= Página principal ================= */
export default function ServiciosPage() {
  const [clientes, setClientes] = useState([]);
  const [profes, setProfes] = useState([]);
  const [list, setList] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // selección / edición
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // modales
  const [showCobertura, setShowCobertura] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const selected = useMemo(
    () => list.find((s) => s._id === selectedId) || null,
    [list, selectedId]
  );

  const load = async () => {
    try {
      const [c, p, s] = await Promise.all([
        apiFetch("/api/clientes"),
        apiFetch("/api/profesionales"),
        apiFetch("/api/servicios"),
      ]);
      setClientes(c); setProfes(p); setList(s);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const resetSelection = () => {
    setSelectedId(null);
    setEditMode(false);
    setOk("");
    setErr("");
  };

  const onRowClick = (s) => {
    setSelectedId((prev) => (prev === s._id ? null : s._id));
  };

  const onDelete = async () => {
    if (!selected) return;
    const nombreC = selected?.cliente?.nombreApellido || "(sin cliente)";
    const confirma = window.confirm(`¿Eliminar el servicio de ${selected.tipo} para ${nombreC}?`);
    if (!confirma) return;
    try {
      setErr(""); setOk("");
      await apiFetch(`/api/servicios/${selected._id}`, { method: "DELETE" });
      setOk("Servicio eliminado");
      resetSelection();
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y acciones */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#1D4A74]">Servicios</h1>

        <div className="flex gap-2">
          <button
            onClick={() => { setEditMode(false); setShowForm(true); setOk(""); setErr(""); }}
            className="px-3 py-2 rounded-lg bg-[#04BF8A] text-white hover:bg-[#00A884]"
          >
            + Nuevo servicio
          </button>

          {selectedId && (
            <>
              <button
                onClick={() => { setEditMode(true); setShowForm(true); setOk(""); setErr(""); }}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Modificar
              </button>
              <button
                onClick={() => setShowCobertura(true)}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Cobertura
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </button>
              <button onClick={resetSelection} className="px-3 py-2 rounded-lg border bg-yellow-600">
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mensajes globales */}
      {err && <p className="text-red-600">{err}</p>}
      {ok  && <p className="text-green-600">{ok}</p>}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-[#1d4a74]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Tipo</th>
              <th>Cliente</th>
              <th>Profesional</th>
              <th>Rango</th>
              <th>Días</th>
              <th>Cobertura</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const isSel = s._id === selectedId;
              const occ = rangoOcurrencias(s);
              const pagados = (s.coberturaDias || []).filter(
                (cd) => cd?.cubierto && occ.includes(ymdLocal(cd.fecha))
              ).length;
              const pct = occ.length ? Math.round((pagados / occ.length) * 100) : 0;

              return (
                <tr
                  key={s._id}
                  onClick={() => onRowClick(s)}
                  className={`border-t cursor-pointer ${isSel ? "bg-[#04BF8A]/10" : "hover:bg-gray-50"}`}
                  title="Click para seleccionar"
                >
                  <td className="p-2">{s.tipo}</td>
                  <td className="text-center">{s?.cliente?.nombreApellido || "-"}</td>
                  <td className="text-center">{s?.profesional?.nombreApellido || "-"}</td>
                  <td className="text-center">
                    {new Date(s.fechaInicio).toLocaleDateString()} — {new Date(s.fechaFin).toLocaleDateString()}
                  </td>
                  <td className="text-center">{(s.diasSemana || []).map((i) => DIAS[i]).join(", ")}</td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: "#04BF8A" }}></span>
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <ServiceFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => load()}
        initialData={editMode ? selected : null}
        clientes={clientes}
        profes={profes}
      />

      {showCobertura && selected && (
        <CoberturaModal
          servicio={selected}
          onClose={() => setShowCobertura(false)}
          onSaved={() => load()}
        />
      )}
    </div>
  );
}