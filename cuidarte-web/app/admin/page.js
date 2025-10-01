'use client';
import { useRef, useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { API_BASE } from '@/lib/api';
import esLocale from '@fullcalendar/core/locales/es';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [range, setRange]   = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

   // 👇 guardamos el último rango consultado para evitar loops
  const lastRangeRef = useRef({ start: null, end: null });

    // ✅ Memo: evita que FullCalendar crea que cambiaste opciones cada render
  const plugins = useMemo(() => [dayGridPlugin, interactionPlugin], []);
  const locales = useMemo(() => [esLocale], []);

  const [selected, setSelected] = useState(null); // evento seleccionado para modal

  const fetchEvents = useCallback(async (startStr, endStr) => {
    setLoading(true); setErr('');
    try {
      const url = `${API_BASE}/api/servicios/agenda?start=${startStr}&end=${endStr}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data?.error || 'Respuesta inesperada');
      setEvents(data);
    } catch (e) {
      setErr(e.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Se dispara cuando el calendario cambia de rango (mes visible)
  const handleDatesSet = useCallback((arg) => {
    const startStr = arg.startStr.slice(0,10); // YYYY-MM-DD
    const endStr   = arg.endStr.slice(0,10);
    const last = lastRangeRef.current;
    if (last.start === startStr && last.end === endStr) return; // mismo rango -> no hacer nada
    lastRangeRef.current = { start: startStr, end: endStr };
    fetchEvents(startStr, endStr);
  }, [fetchEvents]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-[#1d4a74]">Agenda de Servicios</h1>

      {err && <div className="p-3 text-sm text-white bg-red-500 rounded-lg">{err}</div>}
      {loading && <div className="p-3 text-sm text-gray-600">Cargando eventos…</div>}

      <div className="bg-white rounded-2xl shadow p-4 text-gray-500">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          locales={[esLocale]}
          locale="es"
          height="80vh"
          datesSet={handleDatesSet}
          eventClick={(info) => {
            // info.event.extendedProps viene del backend
            setSelected({
              id: info.event.id,
              title: info.event.title,
              start: info.event.start,
              end: info.event.end,
              ...info.event.extendedProps,
            });
          }}
        />
      </div>

      {/* Modal simple */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white w-[95vw] max-w-xl p-6 rounded-2xl shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-[#1d4a74]">{selected.title}</h2>
              <button
                onClick={()=>setSelected(null)}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#1D4A74]">
              <div>
                <div className="text-gray-500">Fecha</div>
                <div>{selected.fecha || (selected.start ? new Date(selected.start).toLocaleDateString() : '-')}</div>
              </div>
              <div>
                <div className="text-gray-500">Horario</div>
                <div>{selected.horaInicio} — {selected.horaFin}</div>
              </div>
              <div>
                <div className="text-gray-500">Cliente</div>
                <div>{selected?.cliente?.nombreApellido || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Profesional</div>
                <div>
                  {selected?.profesional?.nombreApellido || '—'}
                  {selected?.profesional?.profesion ? ` — ${selected.profesional.profesion}` : ''}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500">Indicaciones</div>
                <div className="whitespace-pre-wrap">{selected?.indicaciones || '—'}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {/* Botones para futuro: reprogramar, cancelar, ver ficha */}
              <button
                onClick={()=>setSelected(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
