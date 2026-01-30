// components/ActionMenu.js
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ActionMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openMenu = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    setPos({
      top: rect.top + rect.height / 2,
      left: rect.left - 12, // 👈 abre hacia la izquierda
    });

    setOpen(true);
  };

  return (
    <>
      {/* BOTÓN */}
      <div className="flex justify-center">
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="
            h-9 w-9 rounded-full
            bg-[#1D4A74] text-white
            flex items-center justify-center
            shadow-lg
            hover:bg-[#163b5c]
            transition
          "
        >
          ⋮
        </button>
      </div>

      {/* MENÚ */}
      {open &&
        pos &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Acciones */}
            <div
              className="fixed z-50 flex flex-col gap-3"
              style={{
                top: pos.top,
                left: pos.left,
                transform: "translate(-100%, -50%)", // 👈 izquierda + centrado
              }}
            >
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setOpen(false);
                    action.onClick();
                  }}
                  className={`
                    flex items-center gap-2
                    px-4 py-2 rounded-full
                    shadow-md text-sm font-medium
                    ${action.className}
                    transition hover:scale-[1.05]
                  `}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
