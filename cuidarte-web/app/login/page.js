// app/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Error en login');
      const rol = data?.usuario?.rol || 'cliente';
      if (rol === 'admin') router.push('/admin');
      else if (rol === 'profesional') router.push('/profesional');
      else router.push('/cliente');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1D4A74] p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 p-6 rounded-2xl shadow-xl bg-white">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-9 w-9 rounded-xl bg-[#04BF8A] inline-flex items-center justify-center text-white font-bold">CT</span>
            <span className="font-semibold tracking-tight text-[#1D4A74]">cuidarTE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D4A74]">Iniciar sesión</h1>
          <p className="text-sm text-gray-500">Ingresá tus credenciales para continuar</p>
        </div>

        <div className="space-y-3">
          <input className="w-full text-[#1D4A74] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
                 placeholder="Email" type="email" value={email}
                 onChange={(e)=>setEmail(e.target.value)} required />
          <input className="w-full text-[#1D4A74] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
                 placeholder="Contraseña" type="password" value={password}
                 onChange={(e)=>setPassword(e.target.value)} required />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button type="submit" disabled={loading}
                className="w-full py-2 rounded-xl bg-[#04BF8A] text-white font-medium hover:bg-[#00A884] disabled:opacity-60">
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>

        <div className="text-xs text-center text-gray-500">¿Olvidaste tu contraseña? Contactá al administrador.</div>
      </form>
    </main>
  );
}
