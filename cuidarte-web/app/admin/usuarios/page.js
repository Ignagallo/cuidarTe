"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";
import UsuarioForm from "@/components/UsuarioForm";
import AsignarPerfilModal from "@/components/AsignarPerfilModal";
import ActionMenu from "@/components/ActionMenu";

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [asignarUser, setAsignarUser] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

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

  const resetPassword = async (user) => {
    const nueva = prompt(`Ingresar nueva contraseña para ${user.email}`);

    if (!nueva) return;

    try {
      await apiFetch(`/api/usuarios/${user._id}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ password: nueva }),
      });
      alert("Contraseña reseteada correctamente");
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // 1️⃣ Activos primero
      if (a.activo !== b.activo) {
        return a.activo ? -1 : 1;
      }

      // 2️⃣ Orden secundario
      let valA, valB;

      if (sortBy === "nombre") {
        valA = a.nombre;
        valB = b.nombre;
      } else if (sortBy === "rol") {
        valA = a.rol;
        valB = b.rol;
      } else if (sortBy === "estado") {
        valA = a.activo ? 1 : 0;
        valB = b.activo ? 1 : 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

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

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
            w-full px-4 py-2 rounded-xl
            border border-gray-300
            text-[#1D4A74]
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#04BF8A]
          "
          />
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {filteredUsers.length} de {users.length}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="min-w-[900px] w-full text-sm">
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
            {filteredUsers.map((u) => (
              <tr
                key={u._id}
                className="border-t hover:bg-[#1D4A74]/5 transition-colors"
              >
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
                <td className="px-4 py-2 text-right">
                  <ActionMenu
                    actions={[
                      {
                        label: "Editar",
                        icon: "✏️",
                        className:
                          "bg-blue-100 text-blue-700 hover:bg-blue-200",
                        onClick: () => openEdit(u),
                      },
                      {
                        label: "Desactivar",
                        icon: "⛔",
                        className: "bg-red-100 text-red-700 hover:bg-red-200",
                        onClick: () => desactivar(u._id),
                      },
                      {
                        label: "Resetear contraseña",
                        icon: "🔑",
                        className:
                          "bg-orange-100 text-orange-700 hover:bg-orange-200",
                        onClick: () => resetPassword(u),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* MOBILE / TABLET */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((u) => (
          <div
            key={u._id}
            className="bg-white rounded-2xl shadow border border-gray-100 p-5 space-y-4"
          >
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[#1D4A74] text-lg">
                  {u.nombre}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                  {u.rol}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium
        ${u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
      `}
              >
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* BODY */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>{u.email}</p>
              <PerfilCell user={u} onAsignar={() => openAsignarPerfil(u)} />
            </div>

            {/* FOOTER – ACCIONES */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button
                onClick={() => openEdit(u)}
                className="
            flex-1 px-2 rounded-lg
            bg-blue-100 text-blue-700 font-medium
            hover:bg-blue-200
            active:scale-[0.97]
            transition
          "
              >
                ✏️ Editar
              </button>

              {u.activo && (
                <button
                  onClick={() => desactivar(u._id)}
                  className="flex-1 px-2 rounded-lg bg-red-100 text-red-700 font-medium active:scale-[0.97] hover:bg-red-200 transition"
                >
                  ⛔ Desactivar
                </button>
              )}

              <button
                onClick={() => resetPassword(u)}
                className="flex-1 px-2 rounded-lg font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-[0.97] transition"
              >
                🔑 Resetear contraseña
              </button>
            </div>
          </div>
        ))}
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
