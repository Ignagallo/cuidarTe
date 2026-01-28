"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AsignarProfesionalModal({
  open,
  onClose,
  cliente,
  onSaved,
}) {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalId, setProfesionalId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    apiFetch("/api/profesionales").then(setProfesionales);
    setProfesionalId("");
    setErr("");
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!profesionalId)
      return setErr("Seleccioná un profesional");

    try {
      await apiFetch("/api/asignaciones", {
        method: "POST",
        body: JSON.stringify({
          cliente: cliente._id,
          profesional: profesionalId,
        }),
      });
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
        className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4"
      >
        <h3 className="text-lg font-semibold text-[#1D4A74]">
          Asignar profesional a {cliente.nombreApellido}
        </h3>

        <select
          value={profesionalId}
          onChange={(e) => setProfesionalId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border"
        >
          <option value="">— Seleccionar profesional —</option>
          {profesionales.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombreApellido} – {p.profesion}
            </option>
          ))}
        </select>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#04BF8A] text-white"
          >
            Asignar
          </button>
        </div>
      </form>
    </div>
  );
}
