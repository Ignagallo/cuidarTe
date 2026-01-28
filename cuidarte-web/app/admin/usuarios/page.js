"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";
import UsuarioForm from "@/components/UsuarioForm";
import AsignarPerfilModal from "@/components/AsignarPerfilModal";

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [asignarUser, setAsignarUser] = useState(null);

  const load = async () => {
    try {
      const data = await apiFetch("/api/usuarios");
      setUsers(Array.isArray(data) ? data : []);
      setErr("");
    } catch (e) {
      console.error("Error cargando usuarios:", e);
      setErr(e.message);
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const save = async (data) => {
    try {
      if (editing) {
        await apiFetch(`/api/usuarios/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch("/api/usuarios", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este usuario?")) return;
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const openAsignarPerfil = (user) => {
    setAsignarUser(user);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1D4A74]">Usuarios</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded bg-[#1D4A74] text-white"
        >
          + Nuevo usuario
        </button>
      </div>

      {err && <p className="text-red-600">{err}</p>}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1D4A74] text-white">
            <tr className="border-t hover:bg-[#1D4A74]/5 transition-colors">
              <th className="px-4 py-2 text-left font-semibold tracking-wide">
                Nombre
              </th>
              <th className="px-4 py-2 text-left font-semibold tracking-wide">
                Email
              </th>
              <th className="px-4 py-2 text-left font-semibold tracking-wide">
                Rol
              </th>
              <th className="px-4 py-2 text-left font-semibold tracking-wide">
                Estado
              </th>
              <th className="px-4 py-2 text-left font-semibold tracking-wide">
                Perfil
              </th>
              <th className="px-4 py-2 text-center font-semibold tracking-wide ">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-[#1D4A74]/5 transition-colors">
                <td className="px-4 py-2 text-[#1D4A74]">{u.nombre}</td>
                <td className="px-4 py-2 text-[#1D4A74]">{u.email}</td>
                <td className="px-4 py-2 capitalize text-[#1D4A74]">{u.rol}</td>
                <td className="px-4 py-2 text-[#1D4A74]">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        u.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <PerfilCell user={u} onAsignar={() => openAsignarPerfil(u)} />
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="px-2 py-1 rounded-md text-sm text-[#1D4A74] hover:bg-[#1D4A74]/10 transition"
                  >
                    Editar
                  </button>
                  {u.activo && (
                    <button
                      onClick={() => desactivar(u._id)}
                      className="px-2 py-1 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Editar usuario" : "Nuevo usuario"}
          onClose={() => setModalOpen(false)}
        >
          <UsuarioForm
            initialData={editing}
            onSubmit={save}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
      {asignarUser && (
        <AsignarPerfilModal
          user={asignarUser}
          onClose={() => setAsignarUser(null)}
          onAssigned={load}
        />
      )}
    </div>
  );
}
function PerfilCell({ user, onAsignar }) {
  if (!user) return null;

  if (user.rol === "admin") {
    return <span className="text-gray-400">—</span>;
  }

  if (user.rol === "cliente") {
    return user.clienteRef ? (
      <span className="text-green-700 text-sm">Cliente</span>
    ) : (
      <button
        onClick={onAsignar}
        className="text-[#1D4A74] hover:underline text-sm"
      >
        Asignar perfil
      </button>
    );
  }

  if (user.rol === "profesional") {
    return user.profesionalRef ? (
      <span className="text-green-700 text-sm">Profesional</span>
    ) : (
      <button
        onClick={onAsignar}
        className="text-[#1D4A74] hover:underline text-sm"
      >
        Asignar perfil
      </button>
    );
  }

  return null;
}
