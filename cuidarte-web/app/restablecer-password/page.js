"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RestablecerPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!token) {
      setError("El enlace de recuperación no es válido o venció.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/usuarios/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setComplete(true);
      setPassword("");
      setConfirmation("");
      window.history.replaceState(null, "", window.location.pathname);
      window.setTimeout(() => router.replace("/login"), 1200);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1D4A74] px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-2xl sm:p-9"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1D4A74]">Restablecer contraseña</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Elegí una contraseña nueva de al menos 6 caracteres.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Nueva contraseña
          <input
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border px-4 py-3 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Repetir contraseña
          <input
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border px-4 py-3 text-[#1D4A74] focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
            type="password"
            minLength={6}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {complete && <p role="status" className="text-sm text-green-700">Contraseña actualizada. Volviendo al inicio de sesión…</p>}

        <button
          type="submit"
          disabled={loading || complete}
          className="w-full rounded-xl bg-[#04BF8A] px-4 py-3 font-semibold text-white transition hover:bg-[#00A884] disabled:opacity-60"
        >
          {loading ? "Actualizando…" : "Guardar contraseña"}
        </button>

        <p className="text-center text-sm">
          <Link href="/login" className="text-[#1D4A74] underline">Volver al inicio de sesión</Link>
        </p>
      </form>
    </main>
  );
}
