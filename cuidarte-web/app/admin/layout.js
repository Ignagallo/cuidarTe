"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import AdminLoading from "../../components/AdminLoading";

const COLLAPSED_WIDTH = 56; // ancho sidebar colapsado (px)

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const MIN_DELAY = 800; // ms (ajustable)
    const start = Date.now();

    getMe().then((user) => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DELAY - elapsed);

      setTimeout(() => {
        if (!user || user.rol !== "admin") {
          router.replace("/login");
        } else {
          setCheckingAuth(false);
        }
      }, remaining);
    });
  }, [router]);

  if (checkingAuth) {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside
        style={{ width: open ? 256 : COLLAPSED_WIDTH }}
        className={`
          hidden lg:block
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
            href="/admin/usuarios"
            icon="🧑‍💻"
            label="Usuarios"
            open={open}
            active={pathname.startsWith('/admin/usuarios')}
          />
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
            href="/admin/usuarios"
            label="Usuarios"
            onClick={() => setMobileOpen(false)}
          />

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
        {children}
      </main>
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
