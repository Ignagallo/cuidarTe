'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const TIPOS = [
  { v:'asistencia_diaria', label:'Asistencia diaria' },
  { v:'acompanamiento',    label:'Acompañamiento' },
  { v:'kinesiologia',      label:'Kinesiología' },
  { v:'enfermeria',        label:'Enfermería' },
  { v:'otro',              label:'Otro' },
];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

export default function ServiciosPage() {
  const [clientes, setClientes] = useState([]);
  const [profes, setProfes] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    tipo:'asistencia_diaria',
    fechaInicio:'', fechaFin:'',
    horaInicio:'', horaFin:'',
    diasSemana: [], cliente:'', profesional:'', indicaciones:''
  });
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [c, p, s] = await Promise.all([
        apiFetch('/api/clientes'),
        apiFetch('/api/profesionales'),
        apiFetch('/api/servicios'),
      ]);
      setClientes(c); setProfes(p); setList(s);
    } catch(e){ setErr(e.message); }
  };
  useEffect(()=>{ load(); }, []);

  const toggleDia = (i) => {
    const has = form.diasSemana.includes(i);
    setForm({...form, diasSemana: has ? form.diasSemana.filter(d=>d!==i) : [...form.diasSemana, i]});
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await apiFetch('/api/servicios', { method: 'POST', body: JSON.stringify(form) });
      setForm({ tipo:'asistencia_diaria', fechaInicio:'', fechaFin:'', horaInicio:'', horaFin:'', diasSemana:[], cliente:'', profesional:'', indicaciones:'' });
      load();
    } catch(e){ setErr(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1d4a74]">Servicios</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow text-[#1d4a74]">
        <select className="border rounded px-3 py-2" value={form.tipo}
                onChange={e=>setForm({...form,tipo:e.target.value})}>
          {TIPOS.map(t=><option key={t.v} value={t.v}>{t.label}</option>)}
        </select>

        <input className="border rounded px-3 py-2" type="date" placeholder="fechaInicio"
               value={form.fechaInicio} onChange={e=>setForm({...form,fechaInicio:e.target.value})} required />
        <input className="border rounded px-3 py-2" type="date" placeholder="fechaFin"
               value={form.fechaFin} onChange={e=>setForm({...form,fechaFin:e.target.value})} required />
        <input className="border rounded px-3 py-2" type="time" placeholder="horaInicio"
               value={form.horaInicio} onChange={e=>setForm({...form,horaInicio:e.target.value})} required />
        <input className="border rounded px-3 py-2" type="time" placeholder="horaFin"
               value={form.horaFin} onChange={e=>setForm({...form,horaFin:e.target.value})} required />

        <div className="col-span-1 md:col-span-4 flex flex-wrap gap-2">
          {DIAS.map((d,i)=>(
            <button type="button" key={i}
              onClick={()=>toggleDia(i)}
              className={`px-3 py-1 rounded border ${form.diasSemana.includes(i)?'bg-[#04bf8a] text-white':'bg-white'}`}>
              {d}
            </button>
          ))}
        </div>

        <select className="border rounded px-3 py-2" value={form.cliente} required
                onChange={e=>setForm({...form,cliente:e.target.value})}>
          <option value="">Cliente…</option>
          {clientes.map(c=><option key={c._id} value={c._id}>{c.nombreApellido}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={form.profesional} required
                onChange={e=>setForm({...form,profesional:e.target.value})}>
          <option value="">Profesional…</option>
          {profes.map(p=><option key={p._id} value={p._id}>{p.nombreApellido} — {p.profesion}</option>)}
        </select>

        <input className="md:col-span-4 border rounded px-3 py-2" placeholder="Indicaciones"
               value={form.indicaciones} onChange={e=>setForm({...form,indicaciones:e.target.value})} />

        {err && <p className="text-red-600 md:col-span-4">{err}</p>}
        <button className="md:col-span-4 bg-[#04bf8a] text-white rounded py-2">Crear servicio</button>
      </form>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm text-[#1d4a74]">
          <thead><tr className="bg-gray-50">
            <th className="text-left p-2">Tipo</th><th>Cliente</th><th>Profesional</th><th>Rango</th><th>Días</th>
          </tr></thead>
          <tbody>
            {list.map(s=>(
              <tr key={s._id} className="border-t">
                <td className="p-2">{s.tipo}</td>
                <td>{s?.cliente?.nombreApellido || '-'}</td>
                <td>{s?.profesional?.nombreApellido || '-'}</td>
                <td>{new Date(s.fechaInicio).toLocaleDateString()} — {new Date(s.fechaFin).toLocaleDateString()}</td>
                <td>{(s.diasSemana||[]).sort().join(',')}</td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="p-3 text-gray-500" colSpan={5}>Sin registros</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}