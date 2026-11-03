"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function CambiarPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);

    if (password.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setErr("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await apiFetch("/api/usuarios/cambiar-password", {
        method: "PUT",
        body: JSON.stringify({ password }),
      });
      setOk(true);

      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `
    w-full px-4 py-3 rounded-xl
    border border-gray-300
    bg-white
    text-[#1D4A74]
    placeholder-gray-400
    transition
    focus:outline-none
    focus:ring-2 focus:ring-[#04BF8A]
    focus:border-[#04BF8A]
    hover:border-gray-400
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D4A74] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-[fadeIn_0.25s_ease-out]"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-white shadow flex items-center justify-center">
            <Image
              src="/nuevologoSinFondo.png"
              alt="CuidarTE"
              width={90}
              height={90}
              priority
            />
          </div>
        </div>

        {/* Texto */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-[#1D4A74]">
            Cambiar contraseña
          </h1>
          <p className="text-sm text-gray-600">
            Por seguridad, debés definir una nueva contraseña para continuar.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            className={inputBase}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Repetir contraseña"
            className={inputBase}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Mensajes */}
        {err && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {ok && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Contraseña actualizada correctamente
          </div>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            bg-[#04BF8A]
            text-white font-medium
            shadow-md
            hover:bg-[#00A884]
            hover:shadow-lg
            active:scale-[0.98]
            transition
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
