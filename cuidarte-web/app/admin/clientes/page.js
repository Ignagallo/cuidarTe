'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const FRIENDLY_PLACEHOLDERS = {
  nombreApellido: 'Nombre y apellido',
  email: 'Email',
  direccion: 'Dirección',
  dni: 'DNI',
  fechaNacimiento: 'Fecha de nacimiento',
  telefono: 'Teléfono',
};

export default function ClientesPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    nombreApellido:'', email:'', direccion:'', dni:'', fechaNacimiento:'', telefono:''
  });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const load = async () => {
    setErr(''); setOk('');
    try {
      const data = await apiFetch('/api/clientes');
      setList(data);
    } catch(e){ setErr(e.message); }
  };
  useEffect(()=>{ load(); }, []);

  const resetForm = () => {
    setForm({ nombreApellido:'', email:'', direccion:'', dni:'', fechaNacimiento:'', telefono:'' });
    setEditMode(false);
    setSelectedId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');

    // Validación client-side por DNI para CREAR (en edición dejamos que sea el backend)
    if (!editMode) {
      const yaExiste = list.some(c => (c.dni || '').trim() === (form.dni || '').trim());
      if (yaExiste) {
        setErr('Ya existe un cliente con ese DNI');
        return;
      }
    }

    try {
      if (editMode && selectedId) {
        await apiFetch(`/api/clientes/${selectedId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        setOk('Cliente actualizado correctamente');
      } else {
        await apiFetch('/api/clientes', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        setOk('Cliente creado correctamente');
      }
      resetForm();
      load();
    } catch(e){
      setErr(e.message);
    }
  };

  const onRowClick = (c) => {
    setSelectedId(prev => prev === c._id ? null : c._id);
  };

  const onEdit = () => {
    const c = list.find(x => x._id === selectedId);
    if (!c) return;
    setForm({
      nombreApellido: c.nombreApellido || '',
      email: c.email || '',
      direccion: c.direccion || '',
      dni: c.dni || '',
      fechaNacimiento: c.fechaNacimiento ? c.fechaNacimiento.slice(0,10) : '',
      telefono: c.telefono || '',
    });
    setEditMode(true);
    setOk('Editando cliente seleccionado');
    setErr('');
  };

  const onDelete = async () => {
    const c = list.find(x => x._id === selectedId);
    if (!c) return;
    const confirma = window.confirm(`¿Eliminar a ${c.nombreApellido} (DNI ${c.dni})? Esta acción no se puede deshacer.`);
    if (!confirma) return;
    setErr(''); setOk('');
    try {
      await apiFetch(`/api/clientes/${selectedId}`, { method: 'DELETE' });
      setOk('Cliente eliminado');
      resetForm();
      load();
    } catch(e){ setErr(e.message); }
  };

  const fields = ['nombreApellido','email','direccion','dni','fechaNacimiento','telefono'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1d4a74]">Clientes</h1>
        {selectedId && (
          <div className="flex gap-2">
            <button onClick={onEdit}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Modificar</button>
            <button onClick={onDelete}
              className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Eliminar</button>
            <button onClick={resetForm}
              className="px-3 py-2 rounded-lg border">Cancelar</button>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow">
        {fields.map((k)=>(
          <input
            key={k}
            className="text-[#1D4A74] placeholder-gray-400 border rounded px-3 py-2"
            required
            type={k==='fechaNacimiento' ? 'date' : 'text'}
            placeholder={FRIENDLY_PLACEHOLDERS[k] || k}
            value={form[k]}
            onChange={e=>setForm({...form,[k]:e.target.value})}
          />
        ))}
        {err && <p className="text-red-600 col-span-full">{err}</p>}
        {ok  && <p className="text-green-600 col-span-full">{ok}</p>}
        <button className="md:col-span-3 bg-[#04bf8a] text-white font-bold rounded py-2">
          {editMode ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-[#1D4A74]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Fecha nac.</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c=> {
              const isSel = c._id === selectedId;
              return (
                <tr
                  key={c._id}
                  onClick={()=>onRowClick(c)}
                  className={`border-t cursor-pointer ${isSel ? 'bg-[#04bf8a]/10' : 'hover:bg-gray-50'}`}
                  title="Click para seleccionar"
                >
                  <td className="p-2">{c.nombreApellido}</td>
                  <td className="text-center">{c.email}</td>
                  <td className="text-center">{c.dni}</td>
                  <td className="text-center">{c.telefono}</td>
                  <td className="text-center">{c.direccion}</td>
                  <td className="text-center">{c.fechaNacimiento ? new Date(c.fechaNacimiento).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
            {list.length===0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
