//app/components/AsignarPerfilModal.js 
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "./Modal";

export default function AsignarPerfilModal({
  user,
  onClose,
  onAssigned,
}) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCliente = user.rol === "cliente";
  const title = isCliente
    ? "Asignar perfil de cliente"
    : "Asignar perfil de profesional";

  useEffect(() => {
    const endpoint = isCliente
      ? "/api/clientes"
      : "/api/profesionales";

    apiFetch(endpoint)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [isCliente]);

  const assign = async () => {
    if (!selectedId) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isCliente
        ? `/api/usuarios/${user._id}/asignar-cliente`
        : `/api/usuarios/${user._id}/asignar-profesional`;

      const body = isCliente
        ? { clienteId: selectedId }
        : { profesionalId: selectedId };

      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      onAssigned();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleccionar…</option>
          {items.map((i) => (
            <option key={i._id} value={i._id}>
              {i.nombreApellido}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={assign}
            disabled={!selectedId || loading}
            className="px-4 py-2 rounded bg-[#1D4A74] text-white disabled:opacity-50"
          >
            Asignar
          </button>
        </div>
      </div>
    </Modal>
  );
}
