'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE;

const initialForm = {
  nombreApellido: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
};

export default function ClienteModal({ editing, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        nombreApellido: editing.nombreApellido || '',
        dni: editing.dni || '',
        email: editing.email || '',
        telefono: editing.telefono || '',
        direccion: editing.direccion || '',
        fechaNacimiento: editing.fechaNacimiento
          ? editing.fechaNacimiento.slice(0, 10)
          : '',
      });
    } else {
      setForm(initialForm);
    }
  }, [editing]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = editing
      ? `${API}/api/clientes/${editing._id}`
      : `${API}/api/clientes`;

    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Error al guardar cliente');
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <form
        onSubmit={submit}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl animate-[fadeIn_0.15s_ease-out]"
      >
        <h2 className="text-xl font-semibold text-[#1D4A74]">
          {editing ? 'Editar cliente' : 'Nuevo cliente'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded">
            {error}
          </div>
        )}

        <input
          placeholder="Nombre y apellido"
          className="w-full border p-2 rounded text-black"
          value={form.nombreApellido}
          onChange={(e) =>
            setForm({ ...form, nombreApellido: e.target.value })
          }
          required
        />

        <input
          placeholder="DNI"
          className="w-full border p-2 rounded text-black"
          value={form.dni}
          onChange={(e) => setForm({ ...form, dni: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded text-black"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          placeholder="Teléfono"
          className="w-full border p-2 rounded text-black"
          value={form.telefono}
          onChange={(e) =>
            setForm({ ...form, telefono: e.target.value })
          }
          required
        />

        <input
          placeholder="Dirección"
          className="w-full border p-2 rounded text-black"
          value={form.direccion}
          onChange={(e) =>
            setForm({ ...form, direccion: e.target.value })
          }
          required
        />

        <input
          type="date"
          className="w-full border p-2 rounded text-black"
          value={form.fechaNacimiento}
          onChange={(e) =>
            setForm({ ...form, fechaNacimiento: e.target.value })
          }
          required
        />

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border bg-red-500 hover:bg-red-900 transition"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="bg-[#1D4A74] text-white px-4 py-2 rounded hover:bg-[#163a5c] transition disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
