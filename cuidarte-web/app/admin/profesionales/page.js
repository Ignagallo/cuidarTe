"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const FRIENDLY = {
  nombreApellido: "Nombre y apellido",
  dni: "DNI",
  telefono: "Teléfono",
  fechaNacimiento: "Fecha de nacimiento",
  direccion: "Dirección",
  profesion: "Profesión",
  cbuCvu: "CBU / CVU",
  email: "Email",
};

// ============= MODAL PARA CARGAR PROFESIONAL ================
function ProfesionalFormModal({ open, onClose, onSaved, initialData }) {
  const editMode = !!initialData;
  const [form, setForm] = useState({
    nombreApellido: "",
    profesion: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
    fotoUrl: "",
    dni: "",
    fechaNacimiento: "",
    cbuCvu: "",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const d = initialData;
      const toYMD = (x) => (x ? new Date(x).toISOString().slice(0, 10) : "");
      setForm({
        nombreApellido: d.nombreApellido || "",
        profesion: d.profesion || "",
        telefono: d.telefono || "",
        email: d.email || "",
        direccion: d.direccion || "",
        observaciones: d.observaciones || "",
        fotoUrl: d.fotoUrl || "",
        dni: d.dni || "",
        fechaNacimiento: toYMD(d.fechaNacimiento),
        cbuCvu: d.cbuCvu || "",
      });
    } else {
      setForm({
        nombreApellido: "",
        profesion: "",
        telefono: "",
        email: "",
        direccion: "",
        observaciones: "",
        fotoUrl: "",
        dni: "",
        fechaNacimiento: "",
        cbuCvu: "",
      });
    }
    setErr("");
  }, [open, initialData]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Validaciones mínimas de front para que el error no llegue al back
    if (!form.dni.trim()) return setErr("El DNI es obligatorio.");
    if (!form.fechaNacimiento)
      return setErr("La fecha de nacimiento es obligatoria.");
    if (!form.cbuCvu.trim()) return setErr("El CBU / CVU es obligatorio.");

    // Normalizar fecha a ISO (el date input ya viene YYYY-MM-DD)
    const payload = {
      ...form,
      fechaNacimiento: new Date(form.fechaNacimiento).toISOString(),
    };

    try {
      if (editMode) {
        await apiFetch(`/api/profesionales/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/profesionales", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
  };
  const [uploading, setUploading] = useState(false);
  async function uploadFoto(file) {
    if (!file) return;
    // control de tamaño
    if (file.size > 5 * 1024 * 1024)
      throw new Error("La imagen no puede superar 5MB");

    const fd = new FormData();
    fd.append("foto", file);

    const base = process.env.NEXT_PUBLIC_API_BASE || "";
    setUploading(true);
    try {
      const res = await fetch(`${base}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { error: await res.text() };
      if (!res.ok) throw new Error(data?.error || "No se pudo subir la imagen");
      // Backend debe responder: { url: '/uploads/abc.jpg' }
      setForm((prev) => ({ ...prev, fotoUrl: data.url }));
    } finally {
      setUploading(false);
    }
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-[95vw] max-w-2xl p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1D4A74]">
            {editMode ? "Editar profesional" : "Nuevo profesional"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[#1D4A74]"
        >
          <div className="md:col-span-2">
            <label className="block text-sm text-[#1D4A74] mb-1">
              Foto del profesional
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                try {
                  await uploadFoto(e.target.files?.[0]);
                } catch (err) {
                  setErr(err.message);
                }
              }}
              className="w-full border rounded px-3 py-2"
              disabled={uploading}
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-1">Subiendo imagen…</p>
            )}

            {form.fotoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE || ""}${
                    form.fotoUrl
                  }`}
                  alt="Preview"
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, fotoUrl: "" }))}
                  className="text-sm border rounded px-2 py-1"
                >
                  Quitar foto
                </button>
              </div>
            )}
          </div>

          <input
            className="border rounded px-3 py-2"
            placeholder="Nombre y Apellido"
            value={form.nombreApellido}
            onChange={(e) =>
              setForm({ ...form, nombreApellido: e.target.value })
            }
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Profesión"
            value={form.profesion}
            onChange={(e) => setForm({ ...form, profesion: e.target.value })}
            required
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="DNI"
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            type="date"
            placeholder="Fecha de nacimiento"
            value={form.fechaNacimiento}
            onChange={(e) =>
              setForm({ ...form, fechaNacimiento: e.target.value })
            }
            required
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="CBU / CVU"
            value={form.cbuCvu}
            onChange={(e) => setForm({ ...form, cbuCvu: e.target.value })}
            required
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <input
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Foto URL (opcional)"
            value={form.fotoUrl}
            onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
          />

          {err && <p className="text-red-600 md:col-span-2">{err}</p>}

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 rounded bg-[#04BF8A] text-white">
              {editMode ? "Guardar cambios" : "Crear profesional"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfesionalesPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    nombreApellido: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    profesion: "",
    cbuCvu: "",
    fotoUrl: "",
    email: "",
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ⬅️ NUEVO: mostrar/ocultar formulario
  const [showForm, setShowForm] = useState(false);
  const [modalData, setModalData] = useState(null);

  const load = async () => {
    setErr("");
    setOk("");
    try {
      setList(await apiFetch("/api/profesionales"));
    } catch (e) {
      setErr(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      nombreApellido: "",
      dni: "",
      telefono: "",
      fechaNacimiento: "",
      direccion: "",
      profesion: "",
      cbuCvu: "",
      fotoUrl: "",
      email: "",
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!editMode) {
      const dup = list.some(
        (p) => (p.dni || "").trim() === (form.dni || "").trim()
      );
      if (dup) {
        setErr("Ya existe un profesional con ese DNI");
        return;
      }
    }
    try {
      if (editMode && selectedId) {
        await apiFetch(`/api/profesionales/${selectedId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setOk("Profesional actualizado correctamente");
      } else {
        await apiFetch("/api/profesionales", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setOk("Profesional creado correctamente");
      }
      resetForm();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onRowClick = (p) => {
    setSelectedId((prev) => (prev === p._id ? null : p._id));
  };

  const onEdit = () => {
    const p = list.find((x) => x._id === selectedId);
    if (!p) return;
    setForm({
      nombreApellido: p.nombreApellido || "",
      dni: p.dni || "",
      telefono: p.telefono || "",
      fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.slice(0, 10) : "",
      direccion: p.direccion || "",
      profesion: p.profesion || "",
      cbuCvu: p.cbuCvu || "",
      fotoUrl: p.fotoUrl || "",
      email: p.email || "",
    });
    setEditMode(true);
    setOk("Editando profesional seleccionado");
    setErr("");
  };

  const onDelete = async () => {
    const p = list.find((x) => x._id === selectedId);
    if (!p) return;
    const confirma = window.confirm(
      `¿Eliminar a ${p.nombreApellido} (DNI ${p.dni})?`
    );
    if (!confirma) return;
    setErr("");
    setOk("");
    try {
      await apiFetch(`/api/profesionales/${selectedId}`, { method: "DELETE" });
      setOk("Profesional eliminado");
      resetForm();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  // Campos de texto/fecha/email
  const fields = [
    ["nombreApellido", "text"],
    ["dni", "text"],
    ["telefono", "text"],
    ["fechaNacimiento", "date"],
    ["direccion", "text"],
    ["profesion", "text"],
    ["cbuCvu", "text"],
    ["email", "email"],
  ];

  // NUEVO: vista y orden
  const [view, setView] = useState("cards"); // 'table' | 'cards'
  const [sortBy, setSortBy] = useState("nombreApellido"); // campo
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  // normaliza strings para ordenar bien
  const norm = (v) => (v ?? "").toString().trim().toLowerCase();

  // devuelve lista ordenada según sortBy/sortDir
  const getSorted = () => {
    const arr = [...list];
    arr.sort((a, b) => {
      const A = norm(sortBy === "dni" ? a.dni : a.nombreApellido);
      const B = norm(sortBy === "dni" ? b.dni : b.nombreApellido);
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  };

  // alterna asc/desc
  const toggleDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <>
      <div className="space-y-6">
        {/* ───────────────── Header: ordenar + vista + acciones selección ───────────────── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-[#1d4a74]">Profesionales</h1>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Orden */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1">
              <span className="text-sm text-gray-800">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm text-gray-400 border rounded px-2 py-1"
              >
                <option value="nombreApellido">Nombre</option>
                <option value="dni">DNI</option>
              </select>
              <button
                type="button"
                onClick={toggleDir}
                className="text-sm border text-gray-400 rounded px-2 py-1"
                title="Cambiar asc/desc"
              >
                {sortDir === "asc" ? "Asc ⬆" : "Desc ⬇"}
              </button>
            </div>

            {/* Vista */}
            <div className="flex bg-white rounded-lg shadow overflow-hidden">
              <button
                type="button"
                onClick={() => setView("table")}
                className={`px-3 py-2 ${
                  view === "table"
                    ? "bg-[#04bf8a] text-white"
                    : "text-[#1d4a74]"
                }`}
              >
                Tabla
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={`px-3 py-2 ${
                  view === "cards"
                    ? "bg-[#04bf8a] text-white"
                    : "text-[#1d4a74]"
                }`}
              >
                Tarjetas
              </button>
            </div>
            <button
              onClick={() => {
                setEditMode(false);
                setModalData(null); // nuevo
                setShowForm(true);
                setOk("");
                setErr("");
              }}
              className="px-3 py-2 rounded-lg bg-[#04BF8A] text-white hover:bg-[#00A884]"
            >
              + Nuevo profesional
            </button>
            {/* Acciones sobre el seleccionado */}
            {selectedId && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const sel = list.find((x) => x._id === selectedId);
                    if (!sel) return;
                    setEditMode(true);
                    setModalData(sel); // editar seleccionado
                    setShowForm(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Modificar
                </button>
                <button
                  onClick={onDelete}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg border"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────── Vista: TABLA ───────────────── */}
        {view === "table" && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm text-[#1D4A74]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">Nombre</th>
                  <th>DNI</th>
                  <th>Profesión</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th>Fecha nac.</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {getSorted().map((p) => {
                  const isSel = p._id === selectedId;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => onRowClick(p)}
                      className={`border-t cursor-pointer ${
                        isSel ? "bg-[#04bf8a]/10" : "hover:bg-gray-50"
                      }`}
                      title="Click para seleccionar"
                    >
                      <td className="p-2">{p.nombreApellido}</td>
                      <td className="text-center">{p.dni}</td>
                      <td className="text-center">{p.profesion}</td>
                      <td className="text-center">{p.telefono}</td>
                      <td className="text-center">{p.email}</td>
                      <td className="text-center">{p.direccion}</td>
                      <td className="text-center">
                        {p.fechaNacimiento
                          ? new Date(p.fechaNacimiento).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="text-center">
                        {p.fotoUrl ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_BASE}${p.fotoUrl}`}
                            alt={p.nombreApellido}
                            className="h-10 w-10 rounded-full object-cover inline-block"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
                {getSorted().length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={8}>
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ───────────────── Vista: TARJETAS ───────────────── */}
        {view === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSorted().map((p) => {
              const isSel = p._id === selectedId;
              return (
                <div
                  key={p._id}
                  className={`bg-white rounded-2xl shadow p-4 border ${
                    isSel ? "border-[#04bf8a]" : "border-transparent"
                  }`}
                >
                  {/* Cabecera con foto grande y nombre */}
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.fotoUrl ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_BASE}${p.fotoUrl}`}
                          alt={p.nombreApellido}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-content-center text-gray-400 text-xs">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1d4a74]">
                        {p.nombreApellido}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {p.profesion || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="mt-3 text-sm text-[#1D4A74] space-y-1">
                    <p>
                      <span className="text-gray-500">DNI:</span> {p.dni || "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Tel:</span>{" "}
                      {p.telefono || "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      {p.email || "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Dirección:</span>{" "}
                      {p.direccion || "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Nac.:</span>{" "}
                      {p.fechaNacimiento
                        ? new Date(p.fechaNacimiento).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(true);
                        setModalData(p); // pasa el profesional actual al modal
                        setShowForm(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Modificar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(p._id);
                        onDelete();
                      }}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId((prev) => (prev === p._id ? null : p._id))
                      }
                      className={`px-3 py-2 rounded-lg border ${
                        isSel ? "border-[#04bf8a] text-[#04bf8a]" : ""
                      }`}
                    >
                      {isSel ? "Seleccionado" : "Seleccionar"}
                    </button>
                  </div>
                </div>
              );
            })}
            {getSorted().length === 0 && (
              <div className="col-span-full text-gray-500 bg-white rounded-xl shadow p-4">
                Sin registros
              </div>
            )}
          </div>
        )}
      </div>
      <ProfesionalFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => load()}
        initialData={modalData} // <— si es null = crear, si tiene objeto = editar
      />
    </>
  );
}
