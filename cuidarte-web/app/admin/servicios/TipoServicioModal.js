//app/admin/servicios/TipoServicioModal.js
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

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
  const editMode = !!initialData;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("#1D4A74");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  }, [open, editMode, initialData]);

  if (!open) return null;

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
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm grid place-items-center">
      <div className="w-[95vw] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#1D4A74]">
              {editMode ? "Editar tipo de servicio" : "Nuevo tipo de servicio"}
            </h3>
            <p className="text-xs text-gray-500">
              Categoría reutilizable para servicios
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 text-xl hover:text-gray-700 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nombre del tipo
            </label>
            <input
              className={inputBase}
              placeholder="Ej: Enfermería, Acompañamiento…"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Color identificador
            </label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              className={`${inputBase} min-h-[90px]`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border bg-gray-50 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1D4A74] hover:bg-[#163a5c]"
              }`}
            >
              {editMode ? "Guardar cambios" : "Crear tipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
