//app/admin/servicios/TipoServicioModal.js
"use client";

import { useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import AdminAuthContext from "@/components/AdminAuthContext";

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

export default function TipoServicioModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  initialData,
}) {
  const { registerUnsavedForm } = useContext(AdminAuthContext);
  const editMode = !!initialData;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("#1D4A74");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    registerUnsavedForm("tipo-servicio-form", open && dirty);
    return () => registerUnsavedForm("tipo-servicio-form", false);
  }, [dirty, open, registerUnsavedForm]);

  useEffect(() => {
    if (!open) return;

    if (editMode) {
      setNombre(initialData.nombre || "");
      setDescripcion(initialData.descripcion || "");
      setColor(initialData.color || "#1D4A74");
    } else {
      setNombre("");
      setDescripcion("");
      setColor("#1D4A74");
    }

    setError("");
    setLoading(false);
    setDirty(false);
  }, [open, editMode, initialData]);

  if (!open) return null;

  const requestClose = () => {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Querés cerrar el formulario?")) return;
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del tipo de servicio es obligatorio.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = editMode
        ? `/api/tipos-servicio/${initialData._id}`
        : "/api/tipos-servicio";

      const method = editMode ? "PUT" : "POST";

      const result = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          color,
        }),
      });

      editMode ? onUpdated(result) : onCreated(result);
      setDirty(false);
      onClose();
    } catch (e) {
      if (e.message?.includes("duplicate")) {
        setError("Ya existe un tipo de servicio con ese nombre.");
      } else {
        setError(e.message || "Error al guardar el tipo de servicio");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={editMode ? "Editar tipo de servicio" : "Nuevo tipo de servicio"} onClose={requestClose} size="max-w-lg" zIndexClass="z-[60]" bodyClassName="min-h-0 overflow-y-auto p-0">
        <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
          <p className="text-sm text-slate-600">Categoría reutilizable para servicios</p>
          <FormField label="Nombre del tipo" htmlFor="tipo-servicio-nombre" required>
            <input id="tipo-servicio-nombre" className={inputBase} placeholder="Ej: Enfermería, Acompañamiento…" value={nombre} onChange={(e) => { setNombre(e.target.value); setDirty(true); }} required />
          </FormField>

          <FormField label="Color identificador" htmlFor="tipo-servicio-color">
            <div className="mt-2 flex items-center gap-4">
              <input id="tipo-servicio-color" type="color" value={color} onChange={(e) => { setColor(e.target.value); setDirty(true); }} className="h-11 w-14 cursor-pointer rounded-lg border" />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </FormField>

          <FormField label="Descripción" htmlFor="tipo-servicio-descripcion">
            <textarea id="tipo-servicio-descripcion" className={`${inputBase} min-h-[90px]`} value={descripcion} onChange={(e) => { setDescripcion(e.target.value); setDirty(true); }} />
          </FormField>

          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-white pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestClose}
              className="min-h-11 rounded-xl border bg-gray-50 px-4 py-2.5 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`min-h-11 rounded-xl px-5 py-2.5 font-medium text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1D4A74] hover:bg-[#163a5c]"
              }`}
            >
              {editMode ? "Guardar cambios" : "Crear tipo"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
