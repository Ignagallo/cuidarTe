// app/admin/layout.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getMe, logout } from "@/lib/api";
import AdminLoading from "../../components/AdminLoading";
import AdminAuthContext from "../../components/AdminAuthContext";
import Modal from "@/components/Modal";

const COLLAPSED_WIDTH = 56; // ancho sidebar colapsado (px)

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [canDeleteRecords, setCanDeleteRecords] = useState(false);
  const [dirtyForms, setDirtyForms] = useState(() => new Set());
  const [confirmLanding, setConfirmLanding] = useState(false);
  const [adminNotice, setAdminNotice] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  const registerUnsavedForm = useCallback((formId, dirty) => {
    setDirtyForms((current) => {
      if (current.has(formId) === dirty) return current;
      const next = new Set(current);
      if (dirty) next.add(formId);
      else next.delete(formId);
      return next;
    });
  }, []);

  const notify = useCallback((message, type = "success") => {
    setAdminNotice({ message, type, id: Date.now() });
  }, []);

  const handleLandingClick = (event) => {
    if (dirtyForms.size === 0) return;
    event.preventDefault();
    setConfirmLanding(true);
  };

  useEffect(() => {
    const MIN_DELAY = 800; // ms (ajustable)
    const start = Date.now();

    getMe().then((user) => {
      setIsSuperadmin(user?.rol === "superadmin");
      setCanDeleteRecords(user?.rol === "admin" || user?.rol === "superadmin");
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DELAY - elapsed);

      setTimeout(() => {
        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.rol !== "admin" && user.rol !== "superadmin") {
          router.replace("/panel");
          return;
        }

        setCheckingAuth(false);
      }, remaining);
    });
  }, [router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch (_error) {
      alert("No se pudo cerrar la sesión. Intentá nuevamente.");
      setLoggingOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  };

  if (checkingAuth) {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside
        style={{ width: open ? 256 : COLLAPSED_WIDTH }}
        className={`
          hidden lg:block fixed
          top-0 left-0 h-screen
          bg-[#1D4A74] text-white
          transition-all duration-300 ease-in-out
          ${open ? "fixed z-50 shadow-2xl" : "absolute z-10"}
        `}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/20">
          <button
            onClick={() => setOpen(!open)}
            className="text-xl hover:text-[#04BF8A]"
          >
            ☰
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-2 px-2">
          <NavItem
            href="/admin"
            icon="📅"
            label="Agenda"
            open={open}
            active={pathname === "/admin"}
          />
          <NavItem
            href="/admin/clientes"
            icon="👥"
            label="Clientes"
            open={open}
            active={pathname.startsWith("/admin/clientes")}
          />
          <NavItem
            href="/admin/profesionales"
            icon="💼"
            label="Profesionales"
            open={open}
            active={pathname.startsWith("/admin/profesionales")}
          />
          <NavItem
            href="/admin/servicios"
            icon="🛠"
            label="Servicios"
            open={open}
            active={pathname.startsWith("/admin/servicios")}
          />
          <NavItem
            href="/admin/coberturas"
            icon="🛡"
            label="Coberturas"
            open={open}
            active={pathname.startsWith("/admin/coberturas")}
          />
          <NavItem
            href="/admin/usuarios"
            icon="🧑‍💻"
            label="Usuarios"
            open={open}
            active={pathname.startsWith("/admin/usuarios")}
          />
          <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#04BF8A]/80 text-left">
            <span className="text-lg">↪️</span>
            {open && <span className="text-sm whitespace-nowrap">Cerrar sesión</span>}
          </button>
        </nav>
      </aside>

      {/* ===== OVERLAY DESKTOP ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="hidden lg:block fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* ===== BOTÓN FLOTANTE MOBILE / TABLET ===== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
            fixed z-50
            flex items-center justify-center
            w-14 h-14 rounded-full
            bg-[#1D4A74] text-white
            shadow-2xl
            hover:scale-105 active:scale-95
            transition
            lg:hidden
            bottom-6 right-6
          "
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* ===== SIDEBAR CIRCULAR MOBILE ===== */}
      <div
        className={`
          fixed inset-0 z-40
          bg-[#1D4A74]
          transition-[clip-path] duration-500 ease-in-out
          lg:hidden
          ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
        style={{
          clipPath: mobileOpen
            ? "circle(150% at 100% 100%)"
            : "circle(0% at 100% 100%)",
        }}
      >
        <nav className="h-full flex flex-col justify-center items-center gap-6 text-white text-2xl">
          <MobileNavItem
            href="/admin"
            label="Agenda"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavItem
            href="/admin/clientes"
            label="Clientes"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavItem
            href="/admin/profesionales"
            label="Profesionales"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavItem
            href="/admin/servicios"
            label="Servicios"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavItem
            href="/admin/coberturas"
            label="Coberturas"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavItem
            href="/admin/usuarios"
            label="Usuarios"
            onClick={() => setMobileOpen(false)}
          />

          <button onClick={handleLogout} disabled={loggingOut} className="font-semibold hover:text-[#04BF8A] transition">
            Cerrar sesión
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="mt-10 text-sm opacity-80"
          >
            Cerrar
          </button>
        </nav>
      </div>

      {/* ===== CONTENIDO ===== */}
      <main
        className={`
        p-4 sm:p-6 transition-all
        ${open ? "lg:ml-[256px]" : "lg:ml-[56px]"}
      `}
      >
        <header className="mb-5 flex min-h-14 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Link
            href="/"
            onClick={handleLandingClick}
            aria-label="Volver a la página principal de Cuidarte"
            className="inline-flex min-h-11 items-center rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]"
          >
            <Image src="/nuevologoSinFondo.png" alt="Cuidarte" width={180} height={54} className="h-10 w-auto object-contain" />
          </Link>
          <span className="hidden text-sm font-medium text-slate-500 sm:inline">Panel administrativo</span>
        </header>
        {adminNotice && (
          <div role={adminNotice.type === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${adminNotice.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            <div className="flex items-center justify-between gap-3">
              <span>{adminNotice.message}</span>
              <button type="button" onClick={() => setAdminNotice(null)} aria-label="Cerrar aviso" className="rounded px-2 py-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">×</button>
            </div>
          </div>
        )}
        <AdminAuthContext.Provider value={{ isSuperadmin, canDeleteRecords, registerUnsavedForm, notify }}>
          {children}
        </AdminAuthContext.Provider>
      </main>

      {confirmLanding && (
        <Modal title="¿Volver a la página principal?" onClose={() => setConfirmLanding(false)} size="max-w-md">
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">Hay cambios sin guardar en el formulario abierto. Si salís del panel, se perderán. Tu sesión seguirá activa.</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmLanding(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Seguir en el panel</button>
              <button type="button" onClick={() => { setConfirmLanding(false); router.push("/"); }} className="min-h-11 rounded-xl bg-[#1D4A74] px-4 py-2 font-medium text-white hover:bg-[#163a5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Salir a la página principal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ===== ITEMS ===== */

function NavItem({ href, icon, label, open, active }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        ${active ? "bg-[#04BF8A]" : "hover:bg-[#04BF8A]/80"}
      `}
    >
      <span className="text-lg">{icon}</span>
      {open && <span className="text-sm whitespace-nowrap">{label}</span>}
    </Link>
  );
}

function MobileNavItem({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-semibold hover:text-[#04BF8A] transition"
    >
      {label}
    </Link>
  );
}
