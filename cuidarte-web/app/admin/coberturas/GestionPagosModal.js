"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import EstadoCoberturaBadge from "./EstadoCoberturaBadge";

export default function GestionPagosModal({ cobertura, onClose, onUpdated }) {
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(cobertura);
  const [processingPagoId, setProcessingPagoId] = useState(null);

  const estadoColor = {
    impago: "text-red-600",
    parcial: "text-yellow-600",
    pago: "text-green-600",
  };

  /* ================= AGREGAR PAGO ================= */
  const agregarPago = async () => {
    setErr("");
    if (!monto || Number(monto) <= 0) {
      setErr("El monto debe ser mayor a 0");
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/coberturas/${cobertura.servicio._id}/pagos`, {
        method: "POST",
        body: JSON.stringify({
          monto: Number(monto),
          nota,
        }),
      });

      setMonto("");
      setNota("");
      onUpdated();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDITAR PAGO ================= */
  const editarPago = async (pagoId) => {
    const pagoActual = data.pagos.find((p) => p._id === pagoId);
    if (!pagoActual || pagoActual.anulado) return;

    const nuevoMonto = prompt("Nuevo monto:", pagoActual.monto);
    if (!nuevoMonto || Number(nuevoMonto) <= 0) return;

    const nuevaNota = prompt("Nota:", pagoActual.nota || "");

    try {
      setProcessingPagoId(pagoId);

      const updated = await apiFetch(
        `/api/coberturas/${data._id}/pagos/${pagoId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            monto: Number(nuevoMonto),
            nota: nuevaNota,
          }),
        },
      );

      setData(updated); // 🔑 CLAVE
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessingPagoId(null);
    }
  };

  /* ================= ANULAR PAGO ================= */
  const anularPago = async (pagoId) => {
    const pagoActual = data.pagos.find((p) => p._id === pagoId);
    if (!pagoActual || pagoActual.anulado) return;

    if (!confirm("¿Anular este pago?")) return;

    try {
      setProcessingPagoId(pagoId);

      const updated = await apiFetch(
        `/api/coberturas/${data._id}/pagos/${pagoId}`,
        { method: "DELETE" },
      );

      setData(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessingPagoId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center animate-fade-in">
      <div className="bg-white w-[95vw] max-w-3xl rounded-2xl p-4 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1D4A74]">
              Gestión de pagos
            </h2>
            <p className="text-sm text-gray-600">
              {data.servicio?.tipoServicio?.nombre ?? "Servicio"} —{" "}
              {data.servicio?.cliente?.nombreApellido ?? "Cliente"}
            </p>
          </div>
          <div className="flex justify-center">
            <EstadoCoberturaBadge estado={data.estado} />
            <button
              onClick={onUpdated}
              className="text-2xl mx-4 cursor-pointer p-1 text-red hover:bg-black/20 hover:rounded-lg hover:p-1"
            >
              ❌
            </button>
          </div>
        </div>
        {/* RESUMEN */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="rounded-lg border flex flex-col justify-center bg-gray-50 items-center">
            <p className="text-xs text-center text-gray-500">
              Total del servicio
            </p>
            <p className="text-lg font-semibold text-center text-gray-800">
              ${data.totalServicio}
            </p>
          </div>

          <div className="rounded-lg border p-2 flex flex-col justify-center bg-gray-50">
            <p className="text-xs text-center text-gray-500">Total pagado</p>
            <p className="text-lg text-center font-semibold text-gray-800">
              ${data.totalPagado}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {/* LISTADO DE PAGOS */}
          <table className="w-full text-sm mb-6 border rounded-lg overflow-hidden ">
            <thead className="bg-gray-300 text-center text-[#1D4A74]">
              <tr>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-center">Monto</th>
                <th className="p-2">Nota</th>
                <th className="p-2">Admin</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {React.Children.toArray(
                data.pagos.length > 0
                  ? data.pagos.map((p) => (
                      <tr
                        key={p._id}
                        className={`border-t transition text-center text-[#1D4A74] hover:bg-gray-50 ${
                          p.anulado ? "opacity-50 line-through" : ""
                        }`}
                      >
                        <td className="p-2 text-left">
                          {new Date(p.fecha).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-center">${p.monto}</td>
                        <td className="p-2">{p.nota || "-"}</td>
                        <td className="p-2">{p.admin?.nombre ?? "Admin"}</td>
                        <td className="p-2 text-center">
                          {!p.anulado && (
                            <span>
                              <button
                                disabled={processingPagoId === p._id}
                                onClick={() => editarPago(p._id)}
                                className="px-2 cursor-pointer text-blue-600 hover:text-blue-800 transition disabled:opacity-40"
                              >
                                ✏️
                              </button>

                              <button
                                disabled={processingPagoId === p._id}
                                onClick={() => anularPago(p._id)}
                                className="px-2 cursor-pointer text-red-600 hover:text-red-800 transition disabled:opacity-40"
                              >
                                ❌
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  : [
                      <tr key="no-pagos">
                        <td
                          colSpan={5}
                          className="p-4 text-center text-gray-500"
                        >
                          No hay pagos registrados
                        </td>
                      </tr>,
                    ],
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t bg-white">
          {/* AGREGAR PAGO */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2 text-[#1D4A74]">
              Agregar pago
            </h3>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#1D4A74]/40"
              />
              <input
                placeholder="Nota"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="flex-1 text-[#1D4A74] border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4A74]/40"
              />
              <button
                onClick={agregarPago}
                disabled={loading}
                className="px-4 cursor-pointer py-2 bg-[#04BF8A] text-white
                      hover:bg-[#00a884] rounded"
              >
                Agregar
              </button>
            </div>
          </div>
          {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
        </div>
      </div>
    </div>
  );
}
