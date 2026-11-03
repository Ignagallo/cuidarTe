"use client";

import { useContext, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import AdminAuthContext from "@/components/AdminAuthContext";
import Modal from "@/components/Modal";

export default function DeletePermanentlyButton({ endpoint, label = "Eliminar definitivamente", recordLabel, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const deleteStarted = useRef(false);
  const { canDeleteRecords, notify } = useContext(AdminAuthContext);

  const remove = async () => {
    if (deleteStarted.current) return;
    deleteStarted.current = true;
    setDeleting(true);
    setErrorMessage("");
    try {
      await apiFetch(endpoint, { method: "DELETE" });
    } catch (error) {
      const message = error.message || "No se pudo eliminar el registro.";
      setErrorMessage(message);
      notify(message, "error");
      setDeleting(false);
      deleteStarted.current = false;
      return;
    }

    try {
      const refreshed = await onDeleted?.();
      notify(refreshed === false ? "El registro se eliminó, pero no se pudo actualizar la lista. Volvé a cargar la sección." : "Registro eliminado correctamente.", refreshed === false ? "error" : "success");
    } catch (_refreshError) {
      notify("El registro se eliminó, pero no se pudo actualizar la lista. Volvé a cargar la sección.", "error");
    } finally {
      setDeleting(false);
      deleteStarted.current = false;
      setConfirmOpen(false);
    }
  };

  if (!canDeleteRecords) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMessage("");
          setConfirmOpen(true);
        }}
        disabled={deleting}
        aria-busy={deleting}
        aria-label={deleting ? `Eliminando ${recordLabel || "registro"}` : label}
        className="min-h-11 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        {deleting ? "Eliminando…" : label}
      </button>
      {confirmOpen && (
        <Modal
          title="Confirmar eliminación permanente"
          onClose={() => !deleting && setConfirmOpen(false)}
          closeOnEscape={!deleting}
          showCloseButton={!deleting}
          size="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-700">
              {recordLabel ? <>Vas a eliminar <strong>{recordLabel}</strong>.</> : "Vas a eliminar este registro."}
              {" "}La operación es permanente y no se puede deshacer.
            </p>
            {errorMessage && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => setConfirmOpen(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Cancelar</button>
              <button type="button" disabled={deleting} onClick={remove} className="min-h-11 rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
                {deleting ? "Eliminando…" : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
