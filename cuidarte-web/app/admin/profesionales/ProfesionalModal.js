"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const inputBase = `
  w-full px-4 py-2.5 rounded-xl
  border border-gray-300
  bg-white
  text-gray-800
  placeholder-gray-400
  transition
  focus:outline-none
  focus:ring-2 focus:ring-[#04BF8A]
  focus:border-[#04BF8A]
  hover:border-gray-400
`;

export default function ProfesionalModal({ open, onClose, onSaved, editing }) {
  const editMode = !!editing;

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      const toYMD = (x) => (x ? new Date(x).toISOString().slice(0, 10) : "");
      setForm({
        nombreApellido: editing.nombreApellido || "",
        profesion: editing.profesion || "",
        telefono: editing.telefono || "",
        email: editing.email || "",
        direccion: editing.direccion || "",
        observaciones: editing.observaciones || "",
        fotoUrl: editing.fotoUrl || "",
        dni: editing.dni || "",
        fechaNacimiento: toYMD(editing.fechaNacimiento),
        cbuCvu: editing.cbuCvu || "",
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
  }, [open, editing]);

  async function uploadFoto(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setErr("La imagen no puede superar 5MB");

    const fd = new FormData();
    fd.append("foto", file);

    const base = process.env.NEXT_PUBLIC_API_BASE;
    setUploading(true);

    try {
      const res = await fetch(`${base}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error subiendo imagen");
      setForm((f) => ({ ...f, fotoUrl: data.url }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.dni.trim()) return setErr("El DNI es obligatorio");
    if (!form.fechaNacimiento)
      return setErr("La fecha de nacimiento es obligatoria");
    if (!form.cbuCvu.trim()) return setErr("El CBU / CVU es obligatorio");

    const payload = {
      ...form,
      fechaNacimiento: new Date(form.fechaNacimiento).toISOString(),
    };

    try {
      if (editMode) {
        await apiFetch(`/api/profesionales/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/profesionales", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      onSaved();
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={submit}
        className="bg-white w-[95vw] max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-[#1D4A74]">
            {editMode ? "Editar profesional" : "Nuevo profesional"}
          </h3>
          <button type="button" onClick={onClose} className="text-lg p-1 font-semibold text-[#1D4A74] hover:bg-[#1D4A74] hover:text-white hover:rounded-lg hover:p-1">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className={inputBase} placeholder="Nombre y apellido"
            value={form.nombreApellido}
            onChange={(e) => setForm({ ...form, nombreApellido: e.target.value })}
            required
          />
          <input className={inputBase} placeholder="Profesión"
            value={form.profesion}
            onChange={(e) => setForm({ ...form, profesion: e.target.value })}
            required
          />
          <input className={inputBase} placeholder="DNI"
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
            required
          />
          <input type="date" className={inputBase}
            value={form.fechaNacimiento}
            onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
            required
          />
          <input className={inputBase} placeholder="CBU / CVU"
            value={form.cbuCvu}
            onChange={(e) => setForm({ ...form, cbuCvu: e.target.value })}
            required
          />
          <input className={inputBase} placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
          <input type="email" className={inputBase} placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input className={`${inputBase} md:col-span-2`} placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          <textarea className={`${inputBase} md:col-span-2 h-40`} placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadFoto(e.target.files?.[0])}
            disabled={uploading}
            className="md:col-span-2 text-gray-400 hover:text-[#1D4A74]"
          />

          {err && (
            <p className="text-red-600 md:col-span-2 text-sm">{err}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-gray-500 hover:text-white hover:bg-[#1D4A74]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#04BF8A] text-white hover:bg-[#00A884] hover:text-[#1D4A74] hover:font-bold transition"
          >
            {editMode ? "Guardar cambios" : "Crear profesional"}
          </button>
        </div>
      </form>
    </div>
  );
}