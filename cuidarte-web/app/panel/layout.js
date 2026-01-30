// app/panel/layout.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import AdminLoading from "@/components/AdminLoading";

const COLLAPSED_WIDTH = 64;

export default function PanelLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getMe().then((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      if (u.rol === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(u);
      setChecking(false);
    });
  }, [router]);

  if (checking) return <AdminLoading />;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ===== SIDEBAR ===== */}
      <aside
        style={{ width: open ? 240 : COLLAPSED_WIDTH }}
        className="
            fixed top-0 left-0 h-screen
            bg-[#1D4A74] text-white
            transition-all duration-300 ease-in-out
            flex flex-col
            z-40
          "
      >
        {/* Usuario */}
        <div className="h-24 flex flex-col items-center justify-center gap-2 border-b border-white/20">
          <div className="h-12 w-12 rounded-full bg-[#04BF8A] flex items-center justify-center text-lg font-bold">
            {user.nombre?.charAt(0)}
          </div>
          {open && (
            <div className="text-sm font-medium text-center px-2">
              {user.nombre}
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="h-14 flex items-center justify-center hover:bg-[#163b5c] transition"
        >
          ☰
        </button>

        {/* Nav */}
        <nav className="mt-2 flex flex-col gap-1 px-2">
          <NavItem
            href="/panel"
            icon="📅"
            label="Agenda"
            open={open}
            active={pathname === "/panel"}
          />
        </nav>
      </aside>

      {/* ===== CONTENT ===== */}
      <main
        className="
          flex-1
          p-4 sm:p-6
          overflow-y-auto
          transition-all
        "
        style={{
          marginLeft: open ? 240 : COLLAPSED_WIDTH,
          height: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}

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
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
