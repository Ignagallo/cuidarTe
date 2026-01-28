'use client';

import { useEffect, useState } from 'react';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'cliente', label: 'Cliente' },
];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function RoleHint({ rol }) {
  if (rol === 'admin') {
    return (
      <div className="rounded-xl bg-[#1D4A74]/10 border border-[#1D4A74]/30 px-4 py-3 text-sm text-[#1D4A74]">
        Este usuario tendrá <strong>acceso total</strong> al sistema.
      </div>
    );
  }

  if (rol === 'profesional') {
    return (
      <div className="rounded-xl bg-[#04BF8A]/10 border border-[#04BF8A]/40 px-4 py-3 text-sm text-[#0f5132]">
        Este usuario deberá vincularse a un <strong>perfil profesional</strong>.
      </div>
    );
  }

  if (rol === 'cliente') {
    return (
      <div className="rounded-xl bg-gray-100 border px-4 py-3 text-sm text-gray-700">
        Este usuario representará a un <strong>cliente</strong> del sistema.
      </div>
    );
  }

  return null;
}

export default function UsuarioForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cliente',
    activo: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || '',
        email: initialData.email || '',
        password: '',
        rol: initialData.rol || 'cliente',
        activo: initialData.activo ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = (e) => {
    e.preventDefault();
    console.log('SUBMIT USUARIO:', form);
    onSubmit(form);
  };

  const inputBase = `
    w-full px-4 py-2.5 rounded-xl
    border border-gray-300
    bg-white
    text-gray-800
    transition
    focus:outline-none
    focus:ring-2 focus:ring-[#04BF8A]
    focus:border-[#04BF8A]
    hover:border-gray-400
  `;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div key={form.rol} className="animate-[fadeIn_0.2s_ease-out]">
        <RoleHint rol={form.rol} />
      </div>
      <Field label="Nombre completo">
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className={inputBase}
          placeholder="Ej: Juan Pérez"
          required
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={inputBase}
          placeholder="usuario@correo.com"
          required
        />
      </Field>

      {!initialData && (
        <Field label="Contraseña inicial">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={inputBase}
            placeholder="••••••••"
            required
          />
        </Field>
      )}

      <Field label="Rol del usuario">
        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          className={inputBase}
        >
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>

      {initialData && (
        <label className="flex items-center gap-3 text-sm text-gray-700 pt-2">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
            className="h-4 w-4 accent-[#04BF8A]"
          />
          Usuario activo
        </label>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-5 py-2.5 rounded-xl
            border border-gray-300
            text-gray-700
            hover:bg-gray-100
            transition
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="
            px-5 py-2.5 rounded-xl
            bg-[#1D4A74]
            text-white font-medium
            shadow-md
            hover:bg-[#163a5c]
            hover:shadow-lg
            active:scale-[0.98]
            transition
          "
        >
          Guardar usuario
        </button>
      </div>
    </form>
  );
}

