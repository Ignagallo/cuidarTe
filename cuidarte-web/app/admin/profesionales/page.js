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
  const [showForm, setShowForm] = useState(true);

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
  const [view, setView] = useState("table"); // 'table' | 'cards'
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
    <div className="space-y-6">
      {/* ───────────────── Header: ordenar + vista + acciones selección ───────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#1d4a74]">Profesionales</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Orden */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="nombreApellido">Nombre</option>
              <option value="dni">DNI</option>
            </select>
            <button
              type="button"
              onClick={toggleDir}
              className="text-sm border rounded px-2 py-1"
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
                view === "table" ? "bg-[#04bf8a] text-white" : "text-[#1d4a74]"
              }`}
            >
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`px-3 py-2 ${
                view === "cards" ? "bg-[#04bf8a] text-white" : "text-[#1d4a74]"
              }`}
            >
              Tarjetas
            </button>
          </div>

          {/* Acciones sobre el seleccionado */}
          {selectedId && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
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

      {/* ───────────────── Formulario Crear/Editar ───────────────── */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#1D4A74]">
              {editMode ? "Editar profesional" : "Nuevo profesional"}
            </h2>
            <p className="text-xs text-gray-500">
              {editMode
                ? "Guardá los cambios o cancelá para volver a crear uno nuevo."
                : "Completá los datos y subí una foto opcional."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="text-sm border rounded px-3 py-1"
          >
            {showForm ? "Ocultar" : "Mostrar"} formulario
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4"
          >
            {/* Upload de foto */}
            <div className="md:col-span-3">
              <label className="block text-sm text-[#1D4A74] mb-1">
                Foto del profesional
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("foto", file);
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_BASE}/api/upload`,
                      {
                        method: "POST",
                        body: fd,
                      }
                    );
                    const ct = res.headers.get("content-type") || "";
                    const data = ct.includes("application/json")
                      ? await res.json()
                      : { error: await res.text() };
                    if (!res.ok)
                      throw new Error(
                        data?.error || "No se pudo subir la imagen"
                      );
                    setForm({ ...form, fotoUrl: data.url }); // ej: /uploads/123.jpg
                    setOk("Imagen subida correctamente");
                  } catch (err) {
                    setErr(err.message);
                  }
                }}
                className="w-full border rounded px-3 py-2"
              />
              {form.fotoUrl && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE}${form.fotoUrl}`}
                  alt="Preview"
                  className="h-20 mt-2 rounded object-cover"
                />
              )}
            </div>

            {/* Campos de texto */}
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="Nombre y apellido"
              value={form.nombreApellido}
              onChange={(e) =>
                setForm({ ...form, nombreApellido: e.target.value })
              }
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="DNI"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="date"
              placeholder="Fecha de nacimiento"
              value={form.fechaNacimiento}
              onChange={(e) =>
                setForm({ ...form, fechaNacimiento: e.target.value })
              }
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="Dirección"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="Profesión"
              value={form.profesion}
              onChange={(e) => setForm({ ...form, profesion: e.target.value })}
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="text"
              placeholder="CBU / CVU"
              value={form.cbuCvu}
              onChange={(e) => setForm({ ...form, cbuCvu: e.target.value })}
            />
            <input
              className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* Mensajes y acciones */}
            {err && <p className="text-red-600 md:col-span-3">{err}</p>}
            {ok && <p className="text-green-600 md:col-span-3">{ok}</p>}

            <div className="md:col-span-3 flex gap-2">
              <button className="bg-[#04bf8a] text-white font-bold rounded px-4 py-2">
                {editMode ? "Guardar cambios" : "Crear profesional"}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border rounded px-4 py-2"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        )}
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
                      /* selecciono y edito */ setSelectedId(p._id);
                      onEdit();
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
  );
}
