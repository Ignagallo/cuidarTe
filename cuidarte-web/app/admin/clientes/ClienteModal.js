'use client';

import { useContext, useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import FormField from '@/components/FormField';
import { apiFetch } from '@/lib/api';
import AdminAuthContext from '@/components/AdminAuthContext';

const initialForm = {
  nombreApellido: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
};

export default function ClienteModal({ editing, onClose, onSaved }) {
  const { registerUnsavedForm } = useContext(AdminAuthContext);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    registerUnsavedForm('cliente-form', dirty);
    return () => registerUnsavedForm('cliente-form', false);
  }, [dirty, registerUnsavedForm]);

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
      setForm({ ...initialForm });
    }
    setDirty(false);
    setError('');
  }, [editing]);

  const requestClose = () => {
    if (dirty && !confirm('Hay cambios sin guardar. ¿Querés cerrar el formulario?')) return;
    onClose();
  };

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch(editing ? `/api/clientes/${editing._id}` : '/api/clientes', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, fechaNacimiento: new Date(form.fechaNacimiento).toISOString() }),
      });
      setDirty(false);
      await onSaved?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={editing ? 'Editar cliente' : 'Nuevo cliente'} onClose={requestClose} bodyClassName="min-h-0 overflow-y-auto p-0" size="max-w-2xl">
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
          <FormField label="Nombre y apellido" htmlFor="cliente-nombre" required>
            <input id="cliente-nombre" autoComplete="name" className={inputClass} value={form.nombreApellido} onChange={(e) => update('nombreApellido', e.target.value)} required />
          </FormField>
          <FormField label="DNI" htmlFor="cliente-dni" required>
            <input id="cliente-dni" inputMode="numeric" className={inputClass} value={form.dni} onChange={(e) => update('dni', e.target.value)} required />
          </FormField>
          <FormField label="Email" htmlFor="cliente-email" required>
            <input id="cliente-email" type="email" autoComplete="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </FormField>
          <FormField label="Teléfono" htmlFor="cliente-telefono" required>
            <input id="cliente-telefono" type="tel" autoComplete="tel" className={inputClass} value={form.telefono} onChange={(e) => update('telefono', e.target.value)} required />
          </FormField>
          <FormField label="Dirección" htmlFor="cliente-direccion" required className="sm:col-span-2">
            <input id="cliente-direccion" autoComplete="street-address" className={inputClass} value={form.direccion} onChange={(e) => update('direccion', e.target.value)} required />
          </FormField>
          <FormField label="Fecha de nacimiento" htmlFor="cliente-fecha" required>
            <input id="cliente-fecha" type="date" className={inputClass} value={form.fechaNacimiento} onChange={(e) => update('fechaNacimiento', e.target.value)} required />
          </FormField>
        </div>
        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={requestClose} className="min-h-11 rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Cancelar</button>
          <button type="submit" disabled={loading} className="min-h-11 rounded-xl bg-[#1D4A74] px-5 py-2.5 font-medium text-white hover:bg-[#163a5c] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-2">
            {loading ? 'Guardando…' : 'Guardar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[#1D4A74] outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]";
