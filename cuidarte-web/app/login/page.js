// app/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState('login'); // login | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const onLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();
      console.log('LOGIN RESPONSE:', data)
      if (!resp.ok) throw new Error(data?.error || 'Error en login');

      const rol = data?.rol || 'cliente';
      if (rol === 'admin') router.push('/admin');
      else if (rol === 'profesional') router.push('/profesional');
      else router.push('/cliente');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/usuarios/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!resp.ok) throw new Error('No se pudo procesar la solicitud');

      setMsg(
        'Si el email existe en el sistema, recibirás instrucciones para restablecer tu contraseña.'
      );
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1D4A74] p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-fade-in">
        
        {/* COLUMNA IZQUIERDA – SOLO DESKTOP */}
        <div className="hidden md:flex flex-col justify-center items-center bg-[#1D4A74] text-white p-10 space-y-6">
          <div className="h-60 w-60 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/nuevologoSinFondo.png"
              alt="Logo cuidarTE"
              width={256}
              height={256}
              className="object-contain"
              priority
            />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold">
              Cuidar también es organizar
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-xs">
              Accedé al sistema de gestión de cuidarTE para acompañar,
              registrar y mejorar cada atención.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA – FORMULARIO */}
        <form
          onSubmit={mode === 'login' ? onLogin : onForgotPassword}
          className="p-8 md:p-10 space-y-6 flex flex-col justify-center animate-slide-in"
        >
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#1D4A74]">
              {mode === 'login' ? 'Iniciar sesión' : 'Recuperar contraseña'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'login'
                ? 'Ingresá tus credenciales para continuar'
                : 'Ingresá tu email y te enviaremos instrucciones'}
            </p>
          </div>

          <div className="space-y-4">
            <input
              className="w-full text-[#1D4A74] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A] transition"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode === 'login' && (
              <input
                className="w-full text-[#1D4A74] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A] transition"
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}
          {msg && <p className="text-green-600 text-sm">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-[#04BF8A] text-white font-medium hover:bg-[#00A884] transition disabled:opacity-60"
          >
            {loading
              ? 'Procesando…'
              : mode === 'login'
              ? 'Entrar'
              : 'Enviar instrucciones'}
          </button>

          <div className="text-xs text-center text-gray-500">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="underline hover:text-[#1D4A74]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="underline hover:text-[#1D4A74]"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Animaciones simples */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out both;
        }
        .animate-slide-in {
          animation: slideIn 0.6s ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
